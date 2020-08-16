export default function gunEventListenerWrapper(eventListener) {
  var events = []
  function wrappedEventListener(value, key, msg, event) {
    events.push(event)
    eventListener(value, key, msg, event)
  }
  function unsubscribe() {
    if (events.length == 0) {
      throw 'unsubscribe failed'
    } else {
     events.forEach((e) => {e.off()}) 
    }
  }
  return [wrappedEventListener, unsubscribe]
}