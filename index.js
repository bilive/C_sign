"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = __importStar(require("../../plugin"));
class Sign extends plugin_1.default {
    constructor() {
        super();
        this.name = '自动签到';
        this.description = '每天自动签到';
        this.version = '0.0.2';
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
        this._getSignInfo(users);
    }
    async loop({ cstMin, cstHour, cstString, users }) {
        if (cstString === '00:10')
            this._signList.clear();
        if (cstMin === 30 && cstHour % 8 === 4)
            this._getSignInfo(users);
    }
    _getSignInfo(users) {
        users.forEach(async (user, uid) => {
            if (this._signList.get(uid) || !user.userData['doSign'])
                return;
            const sign = {
                url: `https://api.live.bilibili.com/rc/v2/Sign/getSignInfo?${plugin_1.AppClient.signQueryBase(user.tokenQuery)}`,
                responseType: 'json',
                headers: user.headers
            };
            const getSignInfo = await plugin_1.tools.XHR(sign, 'Android');
            if (getSignInfo !== undefined && getSignInfo.response.statusCode === 200) {
                if (getSignInfo.body.code === 0) {
                    if (getSignInfo.body.data.is_signed)
                        plugin_1.tools.Log(user.nickname, '自动签到', '今日已签到过');
                    else
                        await this._doSign(user, uid);
                }
                else
                    plugin_1.tools.Log(user.nickname, '自动签到', getSignInfo.body);
            }
            else
                plugin_1.tools.Log(user.nickname, '自动签到', '网络错误');
        });
    }
    async _doSign(user, uid) {
        const sign = {
            url: `https://api.live.bilibili.com/rc/v1/Sign/doSign?${plugin_1.AppClient.signQueryBase(user.tokenQuery)}`,
            responseType: 'json',
            headers: user.headers
        };
        const doSign = await plugin_1.tools.XHR(sign, 'Android');
        if (doSign !== undefined && doSign.response.statusCode === 200) {
            if (doSign.body.code === 0) {
                this._signList.set(uid, true);
                plugin_1.tools.Log(user.nickname, '自动签到', '已签到');
            }
            else
                plugin_1.tools.Log(user.nickname, '自动签到', doSign.body);
        }
        else
            plugin_1.tools.Log(user.nickname, '自动签到', '网络错误');
    }
}
exports.default = new Sign();
