"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = __importStar(require("../../plugin"));
class Sign extends plugin_1.default {
    constructor() {
        super();
        this.name = '自动签到';
        this.description = '每天自动签到';
        this.version = '0.0.1';
        this.author = 'lzghzr';
        this._signList = new Map();
    }
    async load({ defaultOptions, whiteList }) {
        defaultOptions.newUserData['doSign'] = false;
        defaultOptions.info['doSign'] = {
            description: '自动签到',
            tip: '每天自动签到',
            type: 'boolean'
        };
        whiteList.add('doSign');
        this.loaded = true;
    }
    async start({ users }) {
        this._sign(users);
    }
    async loop({ cstMin, cstHour, cstString, users }) {
        if (cstString === '00:10')
            this._signList.clear();
        if (cstMin === 30 && cstHour % 8 === 4)
            this._sign(users);
    }
    _sign(users) {
        users.forEach(async (user, uid) => {
            if (this._signList.get(uid) || !user.userData['doSign'])
                return;
            const sign = {
                uri: `https://api.live.bilibili.com/AppUser/getSignInfo?${plugin_1.AppClient.signQueryBase(user.tokenQuery)}`,
                json: true,
                headers: user.headers
            };
            const signInfo = await plugin_1.tools.XHR(sign, 'Android');
            if (signInfo !== undefined && signInfo.response.statusCode === 200) {
                if (signInfo.body.code === 0 || signInfo.body.code === -500) {
                    this._signList.set(uid, true);
                    plugin_1.tools.Log(user.nickname, '自动签到', '已签到');
                }
                else
                    plugin_1.tools.Log(user.nickname, '自动签到', signInfo.body);
            }
            else
                plugin_1.tools.Log(user.nickname, '自动签到', '网络错误');
        });
    }
}
exports.default = new Sign();
