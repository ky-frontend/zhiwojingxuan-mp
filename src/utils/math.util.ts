export const isNumber = function (value: any) {
  return typeof value === 'number' && !isNaN(value);
};

/**
 ** 加法函数，用来得到精确的加法结果
 ** 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
 ** _add(arg1,arg2)
 ** 返回值：arg1加上arg2的精确结果
 **/
function _add(arg1: number | string, arg2: number | string) {
  if (arg1 === undefined || arg2 === undefined) return 0;
  arg1 = Number(arg1);
  arg2 = Number(arg2);
  if (!isNumber(arg1)) {
    arg1 = 0;
  }
  if (!isNumber(arg2)) {
    arg2 = 0;
  }
  let r1 = 0;
  let r2 = 0;
  let m = 0;
  let c = 0;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  c = Math.abs(r1 - r2);
  m = Math.pow(10, Math.max(r1, r2));
  if (c > 0) {
    const cm = Math.pow(10, c);
    if (r1 > r2) {
      arg1 = Number(arg1.toString().replace('.', ''));
      arg2 = Number(arg2.toString().replace('.', '')) * cm;
    } else {
      arg1 = Number(arg1.toString().replace('.', '')) * cm;
      arg2 = Number(arg2.toString().replace('.', ''));
    }
  } else {
    arg1 = Number(arg1.toString().replace('.', ''));
    arg2 = Number(arg2.toString().replace('.', ''));
  }
  return (arg1 + arg2) / m;
}

//减法
function _sub(num1: number | string, num2: number | string) {
  return _add(num1, -num2);
}

//乘法
function _mul(num1: number | string, num2: number | string) {
  if (num1 === null || num2 === null) return 0;
  if (num1 === undefined || num2 === undefined) return 0;
  let m = 0;
  const s1 = num1.toString();
  const s2 = num2.toString();
  try {
    m += s1.split('.')[1]?.length || 0;
  } catch (e) {
    console.log(e);
  }
  try {
    m += s2.split('.')[1]?.length || 0;
  } catch (e) {
    console.log(e);
  }
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m);
}

export default {
  add: _add,
  sub: _sub,
  mul: _mul,
};
