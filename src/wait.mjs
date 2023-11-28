const wait = ms => new Promise(res => setTimeout(res, ms * 1000));
export default wait;