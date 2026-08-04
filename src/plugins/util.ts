import type { App } from 'vue';

const unitValue = (decimal: number, value: number = 1) => {
  if (decimal > 0) {
    return unitValue(decimal - 1, value * 10);
  }

  return value;
};

export const util = {
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  isIphone() {
    if (
      navigator.userAgent.indexOf('iPhone') != -1 ||
      navigator.userAgent.indexOf('iPod') != -1 ||
      navigator.userAgent.indexOf('iPad') != -1
    )
      return true;
    else return false;
  },

  isAndroid() {
    if (navigator.userAgent.indexOf('Android') != -1) return true;
    else return false;
  },

  withoutSpace(string: string) {
    return string
      .replace(/\s/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();
  },
  /**
   * @param val 값
   * @param decimal 소수점 자릿수
   * @param fixed 소수점 자리 필수 표시
   */
  floatFixed(val: string | number | undefined | null, decimal: number = 0, fixed: boolean = false) {
    // util.floatFixed(12345.43412, 1) => 12345.4
    // util.floatFixed(12345.4545, 3) => 12345.454
    if (val == null) return '0';

    const value = typeof val === 'string' ? parseFloat(val) : val;
    let num = unitValue(decimal);
    if (num === 100) {
      // 1 => 0.9 JS 특성 이슈
      num = 1000;
    }
    let result = String(Math.trunc(value * num) / num);
    if(unitValue(decimal) === 100 && num === 1000) {
      // 1 => 0.9 JS 특성 이슈
      if((result.split('.')[1]?.length ?? 0) > decimal) {
        result = result.split('.')[0] + '.' + (result.split('.')[1] ?? '')?.substring(0, decimal);
      }
    }

    if (decimal > 0 && fixed) {
      const decimalLength = result.split('.')[1] ? result.split('.')[1].length : 0;
      if (decimalLength < decimal) {
        const emptyWord = Array(decimal - decimalLength)
          .fill('0')
          .join('');

        result = result + (result.indexOf('.') < 0 ? '.' : '') + emptyWord;
      } else if (decimalLength > decimal) {
        // num == 100 의 경우 (JS 특성 이슈)
        result = result.substring(0, result.length - 1);
      }
    }
    return result;
  },
  comma(val: string | number, float: boolean = false) {
    // {{ $util.comma(1234123) }}
    if (!val) return '0';

    const value = float ? String(parseFloat(String(val))) : String(val);
    // typeof val !== "number" ? String(parseFloat(val)) : String(val);
    const input = value.trim().split('.');

    return (
      input[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (input.length > 1 ? '.' + input[1] : '')
    );
  },
  rmComma(val: string) {
    if (val == null || val == '' || !val) {
      return '0';
    }
    return String(val).replace(/,/gi, '').trim();
  },
  /**
   * @param val : value
   * @param fixed : 자릿수. (2 : [01, 02, 03...], 3: [001, 002, 03...])
   */
  fillNumber(val: string | number, fixed: number | string) {
    let value = `${val}`;
    if (Number(value.length) < Number(fixed)) {
      for (let i = value.length; i < Number(fixed); i++) {
        value = '0' + value;
      }
    }

    return value;
  },
  getImageUrl(path: string) {
    return new URL(path, import.meta.url).href;
  },
  getToday() {
    const today = new Date();
    return `${today.getFullYear()}${today.getMonth()}${today.getDate()}${today.getHours()}${today.getMinutes()}${today.getSeconds()}`;
  },
  isObjectCompare(obj1: any, obj2: any) {
    const objSort1 = Object.keys(obj1)
      .sort()
      .reduce((o: any, key: string) => ((o[key] = obj1[key]), o), {});
    const objSort2 = Object.keys(obj2)
      .sort()
      .reduce((o: any, key: string) => ((o[key] = obj2[key]), o), {});

    return JSON.stringify(objSort1) === JSON.stringify(objSort2);
  },

  // 기간이 90 미만인 경우 => '90일' 표시
  // 기간이 90일 이상일 경우 => '0년 0개월' 표시
  formatDuration(days: number) {
    if (days < 90) return `${days}일`;

    const years = Math.floor(days / 360);
    const remainingDays = days % 360;
    const months = Math.floor(remainingDays / 30);

    let result = '';
    if (years > 0) result += `${years}년 `;
    if (months > 0) result += `${months}개월`;

    return result.trim();
  },

  // "YYYY.MM.DD" 값을 "YYYYMMDD"로 포맷팅해야 할 때 사용 - day.js 사용 시 IOS에서 error 발생
  daySplitFormat(day: string) {
    if (!day) {
      return '';
    }
    return day.replace(/\./g, '');
  },

  addDotData(date: string) {
    if (!date) {
      return '';
    }
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${year}.${month}.${day}`;
  },

  sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  },
};

export default {
  install: (app: App) => {
    app.config.globalProperties.$util = util;
    app.provide('util', util);
  },
};
