// ! 產品相關(客戶)：
// ! 1.產品的API

// ! 購物車相關(客戶)：
// ! 1.get 取得購物車的資訊
// ! 2.post 新增訂單
// ! 3.patch 修改訂單
// ! 4.delete 刪除單一產品資訊
// ! 5.delete 刪除所有購物車訂單

// !先取得所有產品資訊，將產品資訊印在網頁上
// !取得訂單：客戶觀看購物車有購買了什麼產品
// !新增訂單：客戶點選 新增購物車，將產品資訊加入到購物車中，渲染購物車畫面
// !修改訂單：更改購物車訂單的資訊後渲染畫面。
// !刪除訂單：刪除購物車一筆訂單後渲染畫面。
// !清空購物車：清除購物車所有訂單後，渲染畫面
//*DOM
const productList = document.querySelector('.productWrap'); //*產品清單的 ul
const renderCartList_js = document.querySelector('#renderCartList-js');//*購物車渲染用 tbody
const productSelect_js = document.querySelector('#productSelect-js'); //*產品下拉式選單
const removeAllCart_js = document.querySelector('#removeAllCart-js'); //*購物車 tfoot 
const shoppingCart = document.querySelector('.shoppingCart'); //*購物車 table
//*表單驗證 DOM
const form = document.querySelector('.orderInfo-form'); //*form表單
const inputs = document.querySelectorAll('input[name]');  //*抓出文字欄位
const orderInfo_btn = document.querySelector('.orderInfo-btn'); //*送出訂單按鈕
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay');

//*資料初始化
let productData = []; //*產品資料
let cartListData = []; //*購物車資料

//*監聽
productSelect_js.addEventListener('change', productSelect); //*產品下拉選單
productList.addEventListener('click', addCartList);//*新增購物車
removeAllCart_js.addEventListener('click', removeAllCart);//*購物車刪除全部品項
shoppingCart.addEventListener('click', removeProduct) //*購物車刪除單一品項
renderCartList_js.addEventListener('click', patchProductNum) //*編輯購物車產品數量
orderInfo_btn.addEventListener('click', sendForm) //*送出訂單按鈕

//*取得產品資訊
function getProductData() {
    axios.get('https://livejs-api.hexschool.io/api/livejs/v1/customer/pk24/products')
        .then((res) => {
            productData = res.data.products;
            productRender(productData) //*渲染產品列表
        })
        .catch((err) => {
            console.log(err.response);
        })
}
//*初始化
function init() {
    getProductData()
    getCartList()
}
init(); //*初始化渲染畫面

//*將產品印在網頁上
function productRender(data) {
    let str = '';
    data.forEach((item) => {
        str += `
        <li class="productCard" >
        <h4 class="productType">新品</h4>
        <img src="${item.images}"
            alt="">
        <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
        <p class="nowPrice">NT$${toThousands(item.price)}</p>
        </li>
        `
    })
    productList.innerHTML = str;
}
//*產品列表下拉式選單-篩選功能
function productSelect(e) {
    const categoryFilter = productData.filter((item) => e.target.value === item.category)
    if (e.target.value === '全部') {
        productRender(productData);
    } else {
        productRender(categoryFilter)
    }
}

//*取得購物車資訊
function getCartList() {
    axios.get('https://livejs-api.hexschool.io/api/livejs/v1/customer/pk24/carts')
        .then((res) => {
            cartListData = res.data.carts;
            renderCartList(cartListData); //*渲染購物車畫面
            cartDataEmpty(cartListData); //*如果購物車為空，做出提示
        })
        .catch((err) => {
            console.log(err.response);
        })
}

//*渲染購物車資料
function renderCartList(data) {
    let str = '';
    let productTotal = 0; //*產品總價格
    const productTotal_js = document.getElementById('productTotal-js');

    data.forEach((item) => {
        let productPrice = item.quantity * item.product.price; //*產品價格 = 產品數量 * 產品單價
        productTotal += productPrice; //*算出產品總價格
        str +=
            `
            <tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${toThousands(item.product.price)}</td>
                <td>
                <a href="#"><i class="fas fa-minus" id='removeBtn' data-id='${item.id}' data-num='${item.quantity}' data-removeBtn='remove'></i></a>
                ${item.quantity}
                <a href="#"><i class="fas fa-plus" data-id='${item.id}' data-num='${item.quantity}' data-addBtn='add'></i></a>
                </td>
                <td>NT$${toThousands(productPrice)}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" data-id='${item.id}' data-remove='removeProduct'>
                        clear
                    </a>
                </td>
            </tr>
        `
    })
    renderCartList_js.innerHTML = str;
    productTotal_js.textContent = toThousands(productTotal); //*算出總金額
}

//*新增購物車
function addCartList(e) {
    e.preventDefault();
    let id = e.target.getAttribute('data-id'); //*產品ID
    let productNum = 1;
    if (e.target.getAttribute('class') !== 'addCardBtn') {
        return;
    }
    //*加入購物車，當購物車已有此商品時，將購買的產品數量+1
    cartListData.forEach((item) => {
        if (item.product.id === id) {   //*透過產品ID判斷是否已經購買過該產品
            productNum = parseInt(item.quantity) + 1;  //*產品的數量 = 已有的產品數量+1
        }
    })

    axios.post('https://livejs-api.hexschool.io/api/livejs/v1/customer/pk24/carts', {
        "data": {
            "productId": id,
            "quantity": productNum
        }
    })
        .then((res) => {
            console.log(res.data);
            getCartList()
            swal_noBtn("success","新增成功!!","您新增了一樣產品到購物車",2000)
        })
        .catch((err) => {
            console.log(err.response);
        })
}

//*清除"所有"購物車商品
function removeAllCart(e) {
    e.preventDefault();
    if (e.target.getAttribute('class') !== 'discardAllBtn') {
        return;
    }
    axios.delete('https://livejs-api.hexschool.io/api/livejs/v1/customer/pk24/carts')
        .then((res) => {
            console.log(res);
            getCartList(); //*清空購物車後印出
            swal_btn("success","刪除所有產品成功!!","您已刪除購物車所有產品!!")
        })
        .catch((err) => {
            console.log(err.response);
        })
     if (cartListData.length === 0){
        swal_btn("error","您的購物車已經是空的了!!","您已刪除購物車所有產品!!")
       return;
     }
}

//*刪除"單筆"訂單資料
function removeProduct(e) {
    e.preventDefault();
    let id = e.target.getAttribute('data-id');
    if (e.target.getAttribute('data-remove') !== 'removeProduct') {
        return;
    }
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/pk24/carts/${id}`)
        .then((res) => {
            console.log(res);
            getCartList(); //*刪除後渲染畫面
            swal_noBtn("success","刪除成功!!","已刪除一項產品",2000)
        })
        .catch((err) => {
            console.log(err.response);
        })
}

//*購物車沒資料提示
function cartDataEmpty(cartData) {
    if (cartData.length === 0) {
        renderCartList_js.innerHTML = `<td>目前訂單沒有任何東西</td><td>無</td><td>無</td><td>無</td>`;
    }
}

//*編輯購物車產品數量
function patchProductNum(e) {
    e.preventDefault();
    //*宣告 patch 要的購物車ID、產品數量、點擊的屬性取值 => 賦予到變數
    let productNum = e.target.getAttribute('data-num');
    let cartId = e.target.getAttribute('data-id')
    let activeClass = e.target.getAttribute('class');
    //*如果點擊的不是 + 或 - 按鈕，就中斷程式碼
    if (activeClass !== 'fas fa-plus' && activeClass !== 'fas fa-minus') {
        return;
    } else if (activeClass === 'fas fa-plus') {
        //*如果是點擊 + 按鈕，將產品數量+1後，帶入購物車ID和更新後的產品數量，渲染畫面
        let addProductNum = parseInt(productNum) + 1;
        axios.patch('https://livejs-api.hexschool.io/api/livejs/v1/customer/pk24/carts', {
            "data": {
                "id": cartId,
                "quantity": addProductNum
            }
        })
            .then((res) => {
                console.log(res);
                getCartList();
            })
            .catch((err) => {
                console.log(err.response);
            })
    } else if (activeClass === 'fas fa-minus') {
        //*如果是點擊 - 按鈕，先判斷如果產品數量小於等於 1 ，就提醒無法再減少產品數量，反之將數量-1，帶入購物車ID和更新後的產品數量，渲染畫面
        if (productNum <= 1) {
            swal_noBtn("error","數量減少失敗!!","再按下去商品就會不見唷T__T!!",2000)
            return;
        } else {
            let removeProductNum = parseInt(productNum) - 1;
            axios.patch('https://livejs-api.hexschool.io/api/livejs/v1/customer/pk24/carts', {
                "data": {
                    "id": cartId,
                    "quantity": removeProductNum
                }
            })
                .then((res) => {
                    console.log(res);
                    getCartList();
                })
                .catch((err) => {
                    console.log(err.response);
                })
        }
    }
}

//*送出表單 + 表單驗證
function sendForm(e) {
    e.preventDefault();
    const checkFormValue = []; //*用來檢查陣列錯誤訊息長度，如果錯誤為0，則可以發送表單
    //*表單驗證
    const constraints = {
        "姓名": {
            presence: {
                message: "是必填欄位"
            },
        },
        "電話": {
            presence: {
                message: "是必填欄位"
            },
            length: {
                is: 10,
                wrongLength: "請輸入十碼，例：09-XXXX-XXXX"
            }
        },
        "Email": {
            presence: {
                message: "是必填的欄位"
            },
            email: {
                message: "請輸入正確的格式"
            }
        },
        "寄送地址": {
            presence: {
                message: "是必填的欄位"
            },
        },
        "交易方式": {
            presence: {
                message: "是必填的欄位"
            }
        }
    }
    //*抓出所有表單文字欄位，沒填資料就顯示錯誤
    inputs.forEach((item) => {
        item.parentNode.getElementsByTagName('span')[0].innerText = ''; //*如果有填資料就把錯誤隱藏
        let errors = validate(form, constraints);
        if (errors) {   //*errors  => Email: ['Email 是必填的欄位'] 姓名: ['姓名 是必填欄位'] 寄送地址: ['寄送地址 是必填的欄位'] 電話: ['電話 是必填欄位']
            Object.keys(errors).forEach((keys) => {   //*抓出屬性 keys => 姓名 電話 Email 寄送地址
                document.querySelector(`.${keys}`).textContent = errors[keys];//* log(errors[keys]); 例如： ['姓名 是必填欄位']
                
                //*隨便組一個可以判斷錯誤長度的格式.... => {姓名},{地址},{Email},{電話}
                let obj = {};
                obj.err = keys;
                checkFormValue.push(obj);
            })
        }
    })
    //*如果表單驗證沒錯誤，就送出表單
    if (cartListData.length === 0) {
        swal_btn("error","送出訂單失敗!!","您的購物車沒有任何訂單，快去購買!買好買滿!!")
    } else if (checkFormValue.length === 0) {
        axios.post('https://livejs-api.hexschool.io/api/livejs/v1/customer/pk24/orders', {
            "data": {
                "user": {
                    "name": customerName.value,
                    "tel": customerPhone.value,
                    "email": customerEmail.value,
                    "address": customerAddress.value,
                    "payment": tradeWay.value
                }
            }
        })
        .then((res) => {
            console.log(res);
            form.reset();  //*文字欄位清空
            getCartList();  //*重新渲染購物車畫面
            swal_btn("success","成功送出訂單!!","您已成功發送訂單!!")
        })
        .catch((err) => {
            console.log(err.response);
        })
        
    }
}


//*數字千分位符號
function toThousands(num){
    var parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
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