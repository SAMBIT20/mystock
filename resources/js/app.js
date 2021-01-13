import axios from "axios";
import Noty from "noty";
import moment from 'moment'
import { initAdmin } from "./admin";

let addTOCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");

function updateCart(goodis) {
  axios
    .post("/update-cart", goodis)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: "success",
        timeout: 1000,
        text: "Item added to cart",
        progressBar: false,
      }).show();
    })
    .catch((err) => {
      new Noty({
        type: "error",
        timeout: 1000,
        text: "Something went wrong",
        progressBar: false,
      }).show();
    });
}

addTOCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let goodis = JSON.parse(btn.dataset.goodis);
    updateCart(goodis);
  });
});

// Remove alert message after X seconds
const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
}



// Change order status
let statuses = document.querySelectorAll(".status_line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement('small')

function updateStatus(order) {

  statuses.forEach((status)=>{

    status.classList.remove('step-completed')
    status.classList.remove('current')
  })

  let stepCompleted = true;
  statuses.forEach((status) => {
    let dataProp = status.dataset.status;
    if (stepCompleted) {
      status.classList.add("step-completed");
    }
    if (dataProp === order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format('dd/MM/yyyy hh:mm A')
      status.appendChild(time)
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}

updateStatus(order);

//Socket
let socket = io()
initAdmin(socket);
// Join
if(order) {
  socket.emit('join', `order_${order._id}`)
}
let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')) {
  initAdmin(socket)
  socket.emit('join', 'adminRoom')
}


socket.on('orderUpdated', (data) => {
  const updatedOrder = { ...order }
  updatedOrder.updatedAt = moment().format()
  updatedOrder.status = data.status
  updateStatus(updatedOrder)
  new Noty({
      type: 'success',
      timeout: 1000,
      text: 'Order updated',
      progressBar: false,
  }).show();
})