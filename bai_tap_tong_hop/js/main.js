function showNotification (className, content) {
  document.getElementById('notification').classList.add(className);
  document.getElementById('contentNotification').innerText = content;
  setTimeout(() => {
    document.getElementById('notification').classList.remove(className);
    document.getElementById('contentNotification').innerText = '';
  }, 3000);
}

function login () {
  const users = [{
    account: 'admin', password: 'admin'
  }, {
    account: 'admin123', password: 'admin123'
  }];
  const account = document.getElementById('account').value;
  const password = document.getElementById('password').value;
  if (account && password) {
    const checkLogin = users.some(value => (value.account === account && value.password === password));
    if (checkLogin) {
      window.location.replace('dashboard.html');
      localStorage.setItem('tokenLogin', account);
    } else {
      showNotification('alert-danger', 'Wrong account or password');
    }
  } else {
    showNotification('alert-danger', 'Please fill in your account and password completely.');
  }
}

function checkLogin () {
  const isLogin = localStorage.getItem('tokenLogin') && localStorage.getItem('tokenLogin');
  if (!isLogin) {
    window.location.replace('login.html');
  } else {
    window.location.replace('dashboard.html');
  }
}

function checkLoginDashboard () {
  const isLogin = localStorage.getItem('tokenLogin') && localStorage.getItem('tokenLogin');
  if (!isLogin) {
    window.location.replace('login.html');
  } else {
    document.getElementById('accountName').innerText = isLogin;
    renderProduct();
    renderPagination();
  }
}

function logout () {
  localStorage.removeItem('tokenLogin');
  window.location.replace('login.html');
}

function handleInputProductName () {
  document.getElementById('productName').innerText = document.getElementById('name').value;
}

function clearForm () {
  document.getElementById('productName').innerText = '';
  document.getElementById('showImage').innerHTML = ``;
  document.getElementById('image').value = '';
  document.getElementById('category').value = '';
  document.getElementById('name').value = '';
  document.getElementById('price').value = '';
  document.getElementById('addProduct').classList.remove('d-none');
  document.getElementById('editProduct').classList.add('d-none');
}

function showImage () {
  if (document.getElementById('image').value) {
    const image = document.getElementById('image').files.item(0).name;
    document.getElementById('showImage').innerHTML = `<img src='images/${image}' alt='' width='200'>`;
  } else {
    document.getElementById('showImage').innerHTML = ``;
  }
}

async function addProduct () {
  const image = document.getElementById('image').value ? document.getElementById('image').files.item(0).name : '';
  const category = document.getElementById('category').value;
  const name = document.getElementById('name').value;
  const price = document.getElementById('price').value;
  if (image && category && name && price) {
    try {
      await axios.post('http://localhost:2210/products', {
        image: image, category: category, name: name, price: price
      });
      bootstrap.Modal.getInstance(document.getElementById('staticBackdrop')).hide();
      showNotification('alert-success', 'New product has been added');
      clearForm();
    } catch (e) {
      showNotification('alert-danger', e.message);
    }
  } else {
    showNotification('alert-danger', 'Please fill in the complete product information.');
  }
}

async function fetchProduct (page, sort, filter) {
  try {
    return await axios.get(`http://localhost:2210/products?_page=${page}&_limit=6&${sort}&${filter}`);
  } catch (e) {
    console.log(e);
  }
}

function handlePagination (id, button) {
  renderProduct(id);
  let item = document.getElementsByClassName('btn-outline-secondary');
  for (let i = 0; i < item.length; i++) {
    item[i].classList.remove('active');
  }
  button.classList.add('active');

}

function renderPagination () {
  fetchProduct().then(data => {
    let total = data.headers['x-total-count'];
    let buttonGroup = '';
    for (let i = 1; i <= Math.ceil(total / 6); i++) {
      buttonGroup += `<button type='button' onclick='handlePagination(${i}, this)' class='btn btn-outline-secondary'>${i}</button>`;
    }
    document.getElementById('pagination').innerHTML = buttonGroup;
    document.querySelector('.btn-outline-secondary').classList.add('active');
  });
}

function renderProduct (page) {
  if (document.getElementById('tbody')) {
    fetchProduct(page).then(data => {
      let product = ``;
      data.data.map(value => {
        product += `<tr>
            <th scope='row'>${value.id}</th>
            <td>${value.name}</td>
            <td><img src='images/${value.image}' width='80' alt=''></td>
            <td>${value.category}</td>
            <td>${value.price}.00</td>
            <td>
              <button type='button' class='btn btn-warning' data-bs-toggle='modal' data-bs-target='#staticBackdrop' onclick='editProduct(${value.id})'><i class='bi bi-pencil-fill'></i> Edit</button>
              <button type='button' class='btn btn-danger' onclick='deleteProduct(${value.id})'><i class='bi bi-trash-fill'></i> Delete</button>
            </td>
          </tr>`;
      });
      document.getElementById('tbody').innerHTML = product;
    });
  } else {
    fetchProduct(page).then(data => {
      let product = ``;
      data.data.map(value => {
        product += `<div class='col-3'>
          <div class='card mt-3'>
            <img src='images/${value.image}' class='card-img-top' alt='...'>
            <div class='card-body'>
              <h5 class='card-title'>${value.name}</h5>
              <div class='pb-3'>
                <div class='rounded-pill text-primary bg-primary bg-opacity-25 d-inline-block px-3 border border-primary'>
                  ${value.category}
                </div>
              </div>
              <a href='#' class='btn btn-primary'>Add To Cart</a>
            </div>
          </div>
        </div>`;
      });
      document.getElementById('products').innerHTML = product;
    });
  }
}

async function editProduct (id) {
  document.getElementById('addProduct').classList.add('d-none');
  document.getElementById('editProduct').classList.remove('d-none');
  localStorage.setItem('product_id', id);
  try {
    let { data } = await axios.get(`http://localhost:2210/products/${id}`);
    document.getElementById('productName').innerText = data.name;
    document.getElementById('showImage').innerHTML = `<img src='images/${data.image}' alt='' width='200'>`;
    document.getElementById('name').value = data.name;
    document.getElementById('category').value = data.category;
    document.getElementById('price').value = Number(data.price);
  } catch (e) {
    console.log(e);
  }
}

async function saveProduct () {
  const id = localStorage.getItem('product_id');
  const image = document.getElementById('image').value ? document.getElementById('image').files.item(0).name : '';
  const category = document.getElementById('category').value;
  const name = document.getElementById('name').value;
  const price = document.getElementById('price').value;

  if (image) {
    if (category && name && price) {
      await axios.put(`http://localhost:2210/products/${id}`, {
        image: image, category: category, name: name, price: price
      });
    } else {
      showNotification('alert-danger', 'Please fill in the complete product information.');
    }
  } else {
    if (category && name && price) {
      await axios.patch(`http://localhost:2210/products/${id}`, {
        category: category, name: name, price: price
      });
    } else {
      showNotification('alert-danger', 'Please fill in the complete product information.');
    }
  }
  bootstrap.Modal.getInstance(document.getElementById('staticBackdrop')).hide();
  document.getElementById('addProduct').classList.remove('d-none');
  document.getElementById('editProduct').classList.add('d-none');
  renderProduct();
  renderPagination();
}

async function deleteProduct (id) {
  await axios.delete(`http://localhost:2210/products/${id}`);
  renderProduct();
  renderPagination();
}

function loadFunctionIndex () {
  renderProduct();
  renderPagination();
}

















































