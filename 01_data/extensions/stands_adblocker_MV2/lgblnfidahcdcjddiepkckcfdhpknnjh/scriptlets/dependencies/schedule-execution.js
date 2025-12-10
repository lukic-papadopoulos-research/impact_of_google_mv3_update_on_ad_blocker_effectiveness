"use strict";

function scheduleExecution(action, states) {
  const mapReadyStateToValue = inputStates => {
    const stateMapping = {
      loading: 1,
      interactive: 2,
      end: 2,
      '2': 2,
      complete: 3,
      idle: 3,
      '3': 3
    };
    const stateArray = Array.isArray(inputStates) ? inputStates : [inputStates];
    for (const singleState of stateArray) {
      const stateKey = `${singleState}`;
      if (stateMapping[stateKey] !== undefined) {
        return stateMapping[stateKey];
      }
    }
    return 0;
  };
  const targetReadyStateValue = mapReadyStateToValue(states);
  const handleStateChange = () => {
    if (mapReadyStateToValue(document.readyState) >= targetReadyStateValue) {
      action();
      safeSelf().removeEventListener('readystatechange', handleStateChange, true);
    }
  };
  if (mapReadyStateToValue(document.readyState) >= targetReadyStateValue) {
    action();
  } else {
    const safeContext = safeSelf();
    safeContext.addEventListener('readystatechange', handleStateChange, {
      capture: true
    });
  }
}