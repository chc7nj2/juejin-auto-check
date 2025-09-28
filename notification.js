const axios = require('axios');
const fs = require('node:fs');

/**
 * PushPlus通知模块
 * 根据PushPlus官方文档实现消息推送功能
 */
class PushPlusNotification {
  constructor() {
    this.config = this.loadConfig();
    this.apiUrl = 'http://www.pushplus.plus/send';
  }

  /**
   * 加载配置文件
   */
  loadConfig() {
    try {
      if (fs.existsSync('config.json')) {
        const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
        return config.pushplus || { enabled: false };
      }
    } catch (error) {
      console.log('配置文件加载失败，使用默认配置');
    }
    return { enabled: false };
  }

  /**
   * 检查通知是否已启用
   */
  isEnabled() {
    return this.config.enabled && this.config.token;
  }

  /**
   * 发送通知消息
   * @param {string} title - 消息标题
   * @param {string} content - 消息内容
   * @param {string} template - 消息模板类型 (txt, html, json, markdown)
   */
  async sendNotification(title, content, template = 'txt') {
    if (!this.isEnabled()) {
      console.log('PushPlus通知未启用，跳过发送');
      return false;
    }

    try {
      const data = {
        token: this.config.token,
        title: title,
        content: content,
        template: template || this.config.template || 'txt'
      };

      console.log(`正在发送PushPlus通知: ${title}`);
      
      const response = await axios.post(this.apiUrl, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.code === 200) {
        console.log('✅ PushPlus通知发送成功');
        return true;
      } else {
        console.log('❌ PushPlus通知发送失败:', response.data?.msg || '未知错误');
        return false;
      }
    } catch (error) {
      console.log('❌ PushPlus通知发送异常:', error.message);
      return false;
    }
  }

  /**
   * 发送签到成功通知
   * @param {boolean} success - 签到是否成功
   * @param {string} message - 签到结果消息
   */
  async sendSignInNotification(success, message) {
    const title = success ? '🎉 掘金签到成功' : '❌ 掘金签到失败';
    const content = `
签到时间: ${new Date().toLocaleString('zh-CN')}
签到状态: ${success ? '成功' : '失败'}
详细信息: ${message}

${success ? '恭喜您完成今日签到！' : '请检查程序运行状态或手动签到。'}
    `.trim();

    return await this.sendNotification(title, content);
  }

  /**
   * 发送抽奖结果通知
   * @param {boolean} success - 抽奖是否成功
   * @param {string} prize - 抽奖获得的奖品
   */
  async sendLotteryNotification(success, prize) {
    const title = success ? '🎁 掘金抽奖成功' : '❌ 掘金抽奖失败';
    const content = `
抽奖时间: ${new Date().toLocaleString('zh-CN')}
抽奖状态: ${success ? '成功' : '失败'}
${success ? `获得奖品: ${prize}` : `失败原因: ${prize}`}

${success ? '恭喜您获得奖品！' : '请检查是否还有抽奖次数或手动抽奖。'}
    `.trim();

    return await this.sendNotification(title, content);
  }

  /**
   * 发送每日汇总通知
   * @param {Object} summary - 汇总信息
   */
  async sendDailySummary(summary) {
    const title = '📊 掘金自动签到日报';
    const content = `
执行时间: ${new Date().toLocaleString('zh-CN')}

📝 签到结果: ${summary.signIn.success ? '✅ 成功' : '❌ 失败'}
${summary.signIn.message ? `   详情: ${summary.signIn.message}` : ''}

🎲 抽奖结果: ${summary.lottery.success ? '✅ 成功' : '❌ 失败'}
${summary.lottery.prize ? `   奖品: ${summary.lottery.prize}` : ''}

⏱️ 总耗时: ${summary.duration || '未知'}

${summary.signIn.success && summary.lottery.success ? 
  '🎉 今日任务全部完成！' : 
  '⚠️ 部分任务执行失败，请检查日志。'}
    `.trim();

    return await this.sendNotification(title, content);
  }
}

module.exports = PushPlusNotification;
