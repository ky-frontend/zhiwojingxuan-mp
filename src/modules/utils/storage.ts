import Taro from '@tarojs/taro';

const storage = {
  setItem: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key: string) => {
    let value;
    try {
      const data = Taro.getStorageSync(key);
      if (data) {
        value = JSON.parse(data);
      }
    } catch (error) {
      console.error(`getItem ${key} error`, error);
    }
    return value;
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  },
};

export default storage;
