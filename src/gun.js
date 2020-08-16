import Gun from 'gun/gun'
import createTestData from './createTestData'

async function createGun(useTestData) {
  // const gun = Gun(['http://localhost:8765/gun'])
  const gun = Gun()
  // const gun = Gun({
  //   peers: {'http://localhost:8765/gun': {}},
  //   localStorage: true
  // })

  if (useTestData) {
    localStorage.clear()
    await createTestData(gun)
  }

  return gun
}

export default createGun

