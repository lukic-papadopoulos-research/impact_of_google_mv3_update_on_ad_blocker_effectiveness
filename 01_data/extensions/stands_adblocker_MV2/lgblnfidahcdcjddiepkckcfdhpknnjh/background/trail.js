"use strict";

function getTrailText(trail) {
  const result = trail?.reduce((acc, curr, index) => {
    if (index === 0) {
      return curr.host;
    }
    const extraSymbols = {
      [TRAIL_TYPES.opener]: '*',
      [TRAIL_TYPES.user]: '>',
      [TRAIL_TYPES.client]: '#',
      [TRAIL_TYPES.server]: '!',
      [TRAIL_TYPES.javascript]: '~',
      [TRAIL_TYPES.app]: '<'
    };
    const extraSymbol = typeof curr.type === 'number' && extraSymbols[curr.type] ? extraSymbols[curr.type] : '?';
    return `${acc}${extraSymbol}${curr.host}`;
  }, '');
  return result || '';
}
function getTrailType(transitionType, transitionQualifiers) {
  if (transitionType === 'auto_bookmark' || transitionType === 'typed') return TRAIL_TYPES.user;
  if (transitionQualifiers?.includes('forward_back') || transitionQualifiers?.includes('from_address_bar')) {
    return TRAIL_TYPES.user;
  }
  if (transitionType === 'link') {
    return transitionQualifiers?.includes('server_redirect') ? TRAIL_TYPES.javascript : TRAIL_TYPES.client;
  }
  if (transitionQualifiers?.includes('server_redirect')) {
    return TRAIL_TYPES.server;
  }
  return TRAIL_TYPES.client;
}
function setTrailType(props) {
  const trailType = getTrailType(props.transitionType, props.transitionQualifiers);
  props.pageData.trt = props.transitionType;
  props.pageData.trq = props.transitionQualifiers;
  if (props.pageData.trail?.length) {
    for (let i = props.pageData.trail.length - 1; i >= 0; i--) {
      if (props.pageData.trail[i].type === null) {
        props.pageData.trail[i].type = trailType;
        return trailType;
      }
    }
  }
}