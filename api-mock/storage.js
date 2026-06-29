const memory = {}

export default {
  async getStorage(key) {
    return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null
  },
  async setStorage(key, value) {
    memory[key] = String(value)
    return 0
  },
  async removeStorage(key) {
    delete memory[key]
    return 0
  },
  async getStorageKeys() {
    return Object.keys(memory)
  },
  async clearStorage() {
    Object.keys(memory).forEach((key) => {
      delete memory[key]
    })
    return 0
  },
}
