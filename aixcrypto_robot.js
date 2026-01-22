// ==========================================
// 自动下注脚本 (Chrome Console Version)
// ==========================================

(function() {
    // 配置：检查间隔时间（毫秒）
    const INTERVAL = 3000;
    
    // 定时器 ID 变量
    let timerId = null;

    // 工具函数：通过 XPath 获取元素
    function getElementByXPath(xpath) {
        const result = document.evaluate(
            xpath, 
            document, 
            null, 
            XPathResult.FIRST_ORDERED_NODE_TYPE, 
            null
        );
        return result.singleNodeValue;
    }

    // 主逻辑函数
    function autoBetLogic() {
        const timeStr = new Date().toLocaleTimeString();
        
        // 0. 优先检测停止条件
        // 当按钮变为 "100 chances in ..." 倒计时状态时停止脚本
        const stopXPath = "//div[contains(text(), '100 chances in')]";
        const stopElement = getElementByXPath(stopXPath);

        if (stopElement) {
            console.log(`[${timeStr}] 🛑 检测到限制条件 (100 chances in)，脚本自动停止。`);
            console.log(`   提示: 页面可能已进入冷却或限制状态。`);
            if (timerId) clearInterval(timerId);
            return;
        }

        // 1. 检测是否处于 Placing Open 状态
        // 匹配包含 "Placing Open" 文本且具有绿色背景样式的元素
        const statusXPath = "//span[contains(text(), 'Placing Open') and contains(@class, 'bg-emerald-500/20')]";
        const statusElement = getElementByXPath(statusXPath);

        if (!statusElement) {
            console.log(`[${timeStr}] ⏳ 等待中... (非下注时间)`);
            return;
        }

        console.log(`[${timeStr}] ✅ 检测到 Placing Open，开始判断...`);

        // 2. 判断 Previous Round 结果
        // 查找具有特定样式的 Short Won / Long Won 标签
        
        // Short Won (红色字体 text-rose-500)
        const shortWonXPath = "//span[contains(text(), 'Short Won') and contains(@class, 'text-rose-500')]";
        // Long Won (绿色字体 text-emerald-400)
        const longWonXPath = "//span[contains(text(), 'Long Won') and contains(@class, 'text-emerald-400')]";

        const isShortWon = getElementByXPath(shortWonXPath);
        const isLongWon = getElementByXPath(longWonXPath);

        let action = null;

        if (isShortWon) {
            console.log(`   检测结果: 🔴 Short Won (上轮做空赢) -> 策略: 买入做多 (Place Long)`);
            action = "LONG";
        } else if (isLongWon) {
            console.log(`   检测结果: 🟢 Long Won (上轮做多赢) -> 策略: 买入做空 (Place Short)`);
            action = "SHORT";
        } else {
            console.log(`   ⚠️ 未检测到明确的上一轮赢家 (Short Won/Long Won)，跳过本次操作。`);
            return;
        }

        // 3. 执行点击操作
        if (action === "LONG") {
            // 点击 Place Long 按钮 (绿色按钮)
            const btnXPath = "//div[contains(text(), 'Place Long')]";
            const btn = getElementByXPath(btnXPath);
            if (btn) {
                btn.click();
                console.log(`   👉 已点击: Place Long`);
            } else {
                console.error(`   ❌ 错误: 未找到 Place Long 按钮`);
            }
        } else if (action === "SHORT") {
            // 点击 Place Short 按钮 (红色按钮)
            const btnXPath = "//div[contains(text(), 'Place Short')]";
            const btn = getElementByXPath(btnXPath);
            if (btn) {
                btn.click();
                console.log(`   👉 已点击: Place Short`);
            } else {
                console.error(`   ❌ 错误: 未找到 Place Short 按钮`);
            }
        }
    }

    // 启动定时器
    timerId = setInterval(autoBetLogic, INTERVAL);

    console.log(`🚀 脚本已启动！每 ${INTERVAL/1000} 秒检测一次。`);
    console.log(`如需停止脚本，请刷新页面或在控制台输入: clearInterval(${timerId})`);

})();
