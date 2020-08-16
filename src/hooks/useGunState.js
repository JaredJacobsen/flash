import { useEffect, useState } from 'react'
import useGun from './useGun'
import cloneDeep from 'lodash/cloneDeep'
import reduce from 'lodash/reduce'
import transform from 'lodash/transform'
import isObject from 'lodash/isObject'
import gunEventListenerWrapper from '../utils/gunEventListenerWrapper'


function convertGunQueryToObj(gunQuery, args){
  return JSON.parse(
    gunQuery
      .replace(/\s/g,'') //remove whitespace
      .replace(/(\$[^",{}[\]]+)/g, (m) => args[m.slice(1)][0]) //insert args
      .replace(/\[([^{}[\]]+)\]/g, '$1__set') //tag sets
      .replace(/(?<=,|{)([^,{}[\]]+)(?={)/g, '"$1":') //convert to json syntax
      .replace(/(?<=,|{)([^",{}[\]]+)/g, '"$1": null') //set fields to null
  )
}

function syncField(gun, id, key, syncObj, updateState) {
  const sync = (v) => {
    syncObj[key] = v
    // console.log(key, v, syncObj)
    updateState()
  }
  const [wrappedListener, unsubscriber] = gunEventListenerWrapper(sync)
  gun.get(id).get(key).on(wrappedListener)
  return unsubscriber
}

function syncSet(gun, id, key, syncObj, updateState, unsubscribers) {
  
  const trimmedKey = key.slice(0, -5)
  const nodeKeys = syncObj[key]
  delete syncObj[key]

  const childSyncObj = {}
  syncObj[trimmedKey] = childSyncObj

  var event
  unsubscribers.push(() => {
    if (event) {
      event.off()
    }
  })
  
  gun.get(id).get(trimmedKey).map().once((node, _key, _msg, eve) => {
    const nodeId = node._ && node._['#']
    if (!nodeId) {
      return
    }

    if (!event) {
      event = eve
    }
    const nodeSyncObj = cloneDeep(nodeKeys)
    childSyncObj[nodeId] = nodeSyncObj
    
    subscribeSyncObjectHelper(gun, nodeId, nodeSyncObj, updateState, unsubscribers)
  })
}

function subscribeSyncObjectHelper(gun, id, syncObj, updateState, unsubscribers) {
  Object.keys(syncObj).forEach((k) => {
    const v = syncObj[k]
    if (v === null) {
      // console.log(syncObj, v, k, id)
      unsubscribers.push(
        syncField(gun, id, k, syncObj, updateState)
      )
    } else if (typeof v === 'object') {
      if (k.includes('__set')) {
        syncSet(gun, id, k, syncObj, updateState, unsubscribers)
      } else {
        //I use on() rather than once() to get id
        gun.get(id).get(k).on((node, _k, _msg, event) => {
          event.off()
          subscribeSyncObjectHelper(gun, node._['#'], syncObj[k], updateState, unsubscribers)
        })
      }
    }
  })
}

//Todo when a node is deleted, subscriptions to its children are not, which might cause unexpected behavior
function subscribeSyncObject(gun, syncObj, setState) {
  function updateState() {
    // console.log(syncObj)
    setState(cloneDeep(syncObj))
  }
  const unsubscribers = []
  Object.keys(syncObj).forEach((id) => {
    subscribeSyncObjectHelper(gun, id, syncObj[id], updateState, unsubscribers)
  })
  return unsubscribers
}

function replaceKeysDeep(obj, keysMap) {
  return transform(obj, function(result, value, key) {
  
    var currentKey = keysMap[key] || key
  
    result[currentKey] = isObject(value) ? replaceKeysDeep(value, keysMap) : value
  })
}

function renameKeys(state, args) {
  const keysMap = reduce(args, function(result, value, key) {
    result[value[0]] = value[1]
    return result;
  }, {});
  
  return replaceKeysDeep(state, keysMap)
}

//TODO should handle once or on cases
//TODO should have function to get soul and add soul to syncobj
//TODO should return isloading
//TODO should be able to specify names of keys in the return value in the gunQuery
//NOTE: the args should be a tuple with the arg value and what it should be called in the object that is returned
export default function useGunState(gunQuery, args) {
  const [state, setState] = useState()
  const gun = useGun()

  useEffect(() => {
    // console.log('useEffect')
    if (gunQuery) {
      const syncObj = convertGunQueryToObj(gunQuery, args)
      const unsubscribers = subscribeSyncObject(gun, syncObj, setState)
      return () => {
        unsubscribers.forEach((u) => {u()})
      }
    }
    return undefined
  }, [gunQuery, ...Object.values(args).map((v) => v[0])])

  return renameKeys(state, args)
}


//queryfunc is responsible for subscribing to gun events using setState.
//It should also return a function that removes subscriptions.
// export default function useGunState(queryFunc, dependencies=[], syncObj={}) {
//   const [state, setState] = useState({})
//   const gun = useGun()

//   useEffect(() => {
//     return queryFunc(gun, syncObj, setState)
//   }, dependencies)

//   return state
// }