const token = 'usC52ePghwStW4VpGfMBDSHHCfD2';

//*DOM
const orderTable = document.querySelector('.orderTable'); //*訂單的表格
const discardAllBtn = document.querySelector('.discardAllBtn'); //*清除全部訂單

//*監聽
orderTable.addEventListener('click', changeOrderState); //*訂單表格
discardAllBtn.addEventListener('click', removeAllOrder) //*清除全部訂單

//*資料初始化
let orderList = []; //*訂單列表

//*初始化
function init() {
    getOrderList()
}
init() //*初始化渲染

//*設置一個只跑一次函式的變數
let isFirst = true;
//*渲染時顯示圖片加載是否成功
function showChartAlert(){
    if(isFirst){
        if (orderList.length === 0) {
            swal_btn("warning","訂單沒有資料，圖表無法加載!","")

        }else{
            swal_noBtn("success","圖表加載成功!","",1500)
        }
        //*將只跑一次函式的變數改為 false，函式就不會再跑了
        isFirst = false;
    }
}

//*取得訂單列表
function getOrderList() {
    axios.get('https://livejs-api.hexschool.io/api/livejs/v1/admin/pk24/orders', {
        headers: {
            'Authorization': token
        }
    })
        .then((res) => {
            console.log(res);
            orderList = res.data.orders;
            orderTableRender(orderList); //*渲染訂單表格
            c3Render(orderList); //*渲染c3圖表
            showChartAlert(); //*圖表加載成功、失敗提示
        })
        .catch((err) => {
            console.log(err.response);
        })
}

//*訂單表格渲染
function orderTableRender(orderList) {
    let str = '';
    orderList.forEach((item) => {
        //*判斷訂單狀態 已處理、未處理
        let orderState = ''
        if (item.paid === false) {
            orderState = '未處理';
        } else if (item.paid === true) {
            orderState = '已處理'
        }
        //*處理訂單日期時間戳 - Day.js
        let dateStr = '';
        let productTime = item.updatedAt;  //*將時間戳賦予到 productTime 變數上
        let yyyy = dayjs.unix(productTime).year() //*取得年分
        let mm = dayjs.unix(productTime).month() //*取得月份
        let dd = dayjs.unix(productTime).date() //*取得日期
        dateStr += `${yyyy}/${mm}/${dd}`  //*組出日期 年/月/日
        //*組產品字串
        let productsStr = '';
        item.products.forEach((productItem) => {
            productsStr += `
            <p>${productItem.title} x ${productItem.quantity}</p>
            `
        })
        str += `
            <tr>
                <td>${item.createdAt}</td>
                <td>
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                    ${productsStr}
                </td>
                <td>${dateStr}</td>
                <td class="orderStatus">
                    <a href="#" class='changeState' data-orderId='${item.id}' data-orderState='${item.paid}'>${orderState}</a>
                </td>
                <td>
                    <input type="button" data-orderId='${item.id}' class="delSingleOrder-Btn" value="刪除">
                </td>
            </tr> 
            `
    })
    orderTable.innerHTML = str;
    //*如果沒有訂單資料，就顯示 "無"
    if (orderList.length === 0) {
        orderTable.innerHTML = `<tr><td>無</td><td>無</td><td>無</td><td>無</td><td>無</td><td>無</td><td>無</td><td>無</td></tr>`
    }
}

//*修改訂單狀態 + 刪除一筆資料 操作
function changeOrderState(e) {
    e.preventDefault();
    let newOrderState;
    let orderId = e.target.getAttribute('data-orderId');
    let orderState = e.target.getAttribute('data-orderState');
    //*判斷 不是點擊刪除、訂單狀態按鈕 就return
    if (e.target.getAttribute('class') !== 'changeState' && e.target.getAttribute('class') !== 'delSingleOrder-Btn') {
        return;
    } else if (e.target.getAttribute('class') === 'delSingleOrder-Btn') { //*如果點刪除按鈕就執行刪除函式
        removeOrder(orderId)
    } else if (e.target.getAttribute('class') === 'changeState') {  //*如果點訂單狀態就跑修改狀態函式
        if (orderState === 'false') {
            newOrderState = true;
            paidChange(orderId, newOrderState)  //*付費狀態變更
        } else if (orderState === 'true') {
            newOrderState = false;
            paidChange(orderId, newOrderState) //*付費狀態變更
        }
    }
}

//*修改訂單付費狀態
function paidChange(orderId, newOrderState) {
    axios.put('https://livejs-api.hexschool.io/api/livejs/v1/admin/pk24/orders',
        {
            "data": {
                "id": orderId,
                "paid": newOrderState
            }
        }, {
        headers: {
            'Authorization': token
        }
    })
        .then((res) => {
            console.log(res);
            getOrderList();
            swal_noBtn("success","更改成功!!","您更改了客戶的付費狀態!!",1500)
        })
        .catch((err) => {
            console.log(err.response);
        })
}

//*刪除一筆訂單
function removeOrder(orderId) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/pk24/orders/${orderId}`, {
        headers: {
            'Authorization': `${token}`
        }
    })
        .then((res) => {
            console.log(res);
            getOrderList();
            swal_btn("success","已刪除訂單!!","")
        })
        .catch((err) => {
            console.log(err.response);
        })
}

//*刪除全部訂單
function removeAllOrder() {

    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/pk24/orders/`, {
        headers: {
            'Authorization': `${token}`
        }
    })
        .then((res) => {
            console.log(res);
            getOrderList();
            swal_btn("info","您已刪除所有訂單!!","刪除所有訂單後，圖表會跟著消失唷!!")
        })
        .catch((err) => {
            console.log(err.response);
        })
    //*如果訂單是空的就跳錯誤
    if (orderList.length === 0) {
        swal_btn("error","刪除失敗!!","您的訂單列表已經是空的!!")
        return;
    }
}

//*C3圖表渲染
function c3Render(data) {
    //*如果訂單列表沒資料，就更改圖表上方的標題作提醒，有資料才跑圖表
    if (orderList.length === 0) {
        document.querySelector('.section-title').textContent = `您的訂單列表為空，故無法顯示圖表!!`
    }
    //*組出C3要的格式 => ['Louvre 雙人床架', 1], ['Antony 雙人床架', 2], ['Anty 雙人床架', 3], ['其他', 4],
    let obj = {};
    let orderData = [];
    data.forEach((order) => {
        order.products.forEach((products) => {
            if (obj[products.title] === undefined) {
                obj[products.title] = products.price * products.quantity; //*如果沒有這個品項的話就新增一筆進去 {桌子:價格*數量}
            } else {
                obj[products.title] += products.price * products.quantity;
            }
        })   //* obj => {Antony 遮光窗簾: 3600, Louvre 單人床架: 3780, Charles 雙人床架: 15000}
    })
    //*抓出物件屬性  keys => Charles 雙人床架, Louvre 單人床架, Antony 遮光窗簾
    Object.keys(obj).forEach((keys) => {
        let arr = [];
        arr.push(keys);
        arr.push(obj[keys]);
        orderData.push(arr);  //* orderData => [['Antony 遮光窗簾', 3600], ['Louvre 單人床架', 3780], ['Charles 雙人床架', 15000]]
    })

    //*類別含四項，篩選出前三名營收品項，其他 4~8 名都統整為「其它」
    //*先將陣列重新排列，金額由大到小
    //*只顯示三筆資料，多餘的資料金額加總起來，並歸類為"其他"，
    //*若資料不到三筆，就直接做畫面顯示，不需要 "其他"這個分類。

    //*用 sort 重新排列數字大小  => 大 > 小
    orderData = orderData.sort((a, b) => {
        return b[1] - a[1]; //*orderData內都是陣列格式，所以需要使用裡面陣列的 第 [1] 筆 金額去做比較
    })
    //*如果資料大於三筆，列出前三名，將其餘名次加總
    let otherTotal = 0; //*初始化 "其他" 類別的金額總計
    orderData.forEach((products, i) => {
        if (i > 2) {
            otherTotal += products[1]; //*加總其餘產品的金額 [產品,金額] ，所以用 products[1] 抓出金額加總
            orderData.splice(3, i); //*只留前三名，剩下的刪除
            orderData.push(['其他', otherTotal]); //*再加入 '其他' 以及 加總完的金額(otherTotal)
        }
    })
    //* C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: orderData,
            colors: {
                "Louvre 雙人床架": "#DACBFF",
                "Antony 雙人床架": "#9D7FEA",
                "Anty 雙人床架": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}

//*彈跳視窗套件
//*無按鈕版
function swal_noBtn(icon,title,text,time){
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        showConfirmButton: false,
        timer: time
    });
}

//*有按鈕版
function swal_btn(icon,title,text){
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        buttons: true
    });
}
