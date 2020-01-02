import { login, getUserInfo } from '@/api/user'
import { setToken, getToken, setAccess, getAccess, getPermissionIds, setPermissionIds, getUserName, setUserName,
  getUserId, setUserId, setAvator, getAvator, clearCookies, getUserIdentity, setUserIdentity } from '@/libs/util'

export default {
  state: {
    username: getUserName(),
    userId: getUserId(),
    avatorImgPath: getAvator(),
    token: getToken(),
    access: getAccess(),
    userIdentity: getUserIdentity()
  },
  mutations: {
    setAvator (state, avatorPath) {
      state.avatorImgPath = avatorPath;
      setAvator(avatorPath);
    },
    setUserId (state, id) {
      state.userId = id;
      setUserId(id);
    },
    setUsername (state, name) {
      state.username = name;
      setUserName(name);
    },
    setAccess (state, access) {
      state.access = access;
      setAccess(access)
    },
    setToken (state, token) {
      state.token = token;
      setToken(token)
    },
    setUserIdentity (state, userIdentity) {
      state.userIdentity = userIdentity
      setUserIdentity(userIdentity)
    }
  },
  actions: {
    // 登录
    handleLogin ({ commit }, userForm) {
      userForm.username = userForm.username.trim();
      return new Promise((resolve, reject) => {
        console.log(userForm)
        login({
          username: userForm.username,
          password: userForm.password,
          type: userForm.type
        }).then(res => {
          if (res.code === 200) {
            commit('setToken', res.data);
            resolve()
          } else {
            reject(res)
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        clearCookies();
        commit('setAvator', '');
        commit('setUserId', '');
        commit('setUsername', '');
        commit('setToken', '');
        commit('setAccess', []);
        resolve()
      })
    },
    // 获取用户相关信息
    getUserInfo ({ state, commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(res => {
          const data = res.data;
          console.log(data)
          commit('setUserIdentity', data);
          commit('setAvator', data.imageUrl);
          commit('setUsername', data.name);
          commit('setUserId', data.user_id);
          commit('setAccess', data.roles.map(role => role.code) || []);
          resolve(data)
        }).catch(err => {
          reject(err)
        })
      })
    }
  }
}
