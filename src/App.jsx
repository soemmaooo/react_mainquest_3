import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FluidBackground from './FluidBackground';

const { VITE_APP_API_BASE, VITE_APP_API_PATH } = import.meta.env;

function App() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isAuth, setisAuth] = useState(false);
  const productModalRef = useRef(null);
  const [productData, setProductData] = useState([]);
  const initialProductState = {
    title: '',
    category: '',
    origin_price: '',
    price: '',
    unit: '',
    description: '',
    content: '',
    is_enabled: 0,
    imageUrl: ' ',
  };
  const [newProductData, setNewProductData] = useState(initialProductState);
  const [modalMode, setModalMode] = useState('');
  const [preImageUrl, setPreImageUrl] = useState(' ');

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      '$1',
    );
    axios.defaults.headers.common.Authorization = token;
    productModalRef.current = new bootstrap.Modal('#productModal', {
      keyboard: false,
    });
    document
      .querySelector('#productModal')
      .addEventListener('hide.bs.modal', () => {
        setPreImageUrl(null);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      await axios.post(`${VITE_APP_API_BASE}/api/user/check`);
      setisAuth(true);
      getProduct();
    } catch (err) {
      console.log(err.response.data.message);
    }
  };

  const handleInputChange = (e, stateType) => {
    const { id, value, type, checked } = e.target;
    const setter = stateType === 'auth' ? setFormData : setNewProductData;

    let newValue = value;

    if (type === 'checkbox') {
      newValue = id === 'is_enabled' ? (checked ? 1 : 0) : checked;
    } else if (type === 'number') {
      newValue = Number(value);
    }

    setter((prevData) => ({
      ...prevData,
      [id]: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${VITE_APP_API_BASE}/admin/signin`,
        formData,
      );
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common.Authorization = token;
      setisAuth(true);
      getProduct();
    } catch (error) {
      alert('登入失敗: ' + error.response.data.message);
    }
  };

  const getProduct = async () => {
    try {
      const res = await axios.get(
        `${VITE_APP_API_BASE}/api/${VITE_APP_API_PATH}/admin/products`,
      );
      console.log(res.data.products);
      setProductData(res.data.products);
    } catch (error) {
      alert('取得失敗: ' + error.response.data.message);
    }
  };

  const openProductModal = (mode, product = null) => {
    setModalMode(mode);
    if (mode === 'add') {
      setNewProductData(initialProductState);
    } else {
      setNewProductData(product);
    }
    productModalRef.current?.show();
  };

  const handleUpdateProduct = async () => {
    let api = `${VITE_APP_API_BASE}/api/${VITE_APP_API_PATH}/admin/product`;
    let method = 'post';

    if (modalMode === 'edit') {
      api = `${VITE_APP_API_BASE}/api/${VITE_APP_API_PATH}/admin/product/${newProductData.id}`;
      method = 'put';
    }
    try {
      const res = await axios[method](api, { data: newProductData });
      modalMode === 'add' ? alert('新增成功') : alert('修改成功');
      productModalRef.current.hide();
      setNewProductData(initialProductState);
      setPreImageUrl(null);

      getProduct();
    } catch (error) {
      modalMode === 'add'
        ? alert('新增失敗: ' + error.response.data.message)
        : alert('修改失敗: ' + error.response.data.message);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(
        `${VITE_APP_API_BASE}/api/${VITE_APP_API_PATH}/admin/product/${id}`,
      );
      alert('刪除成功');
      getProduct();
    } catch (error) {
      alert('刪除失敗: ' + error.response.data.message);
    }
  };

  return (
    <>
      <FluidBackground />
      {isAuth ? (
        <div>
          <div className="container">
            <div className="d-flex justify-content-between  align-items-center mt-4">
              <h1 className="h3">粉紅魔法商店</h1>
              <button
                className="btn btn-main primary-bg rounded-pill"
                onClick={() => openProductModal('add')}
              >
                建立新的產品
                <i className="bi bi-plus-lg ms-1"></i>
              </button>
            </div>
            <table className="table mt-4 custom-table">
              <thead>
                <tr>
                  <th width="60">圖片</th>
                  <th width="120">分類</th>
                  <th width="240">產品名稱</th>
                  <th width="120">原價</th>
                  <th width="120">售價</th>
                  <th width="100">啟用狀態</th>
                  <th width="120">操作</th>
                </tr>
              </thead>
              <tbody>
                {productData.map((product) => {
                  return (
                    <tr key={product.id}>
                      <td style={{ verticalAlign: 'middle' }}>
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="rounded"
                          style={{
                            height: '40px',
                            width: '40px',
                            objectFit: 'cover',
                          }}
                        />
                      </td>
                      <td>{product.category}</td>
                      <td>{product.title}</td>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>
                        {product.is_enabled ? (
                          <span className="text-success">
                            <i className="bi bi-check-lg"></i>
                          </span>
                        ) : (
                          <span className="text-danger">
                            <i className="bi bi-x-lg"></i>
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-sm "
                            onClick={() => openProductModal('edit', product)}
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button
                            type="button"
                            className="btn  btn-sm"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="container login main-bg">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={(e) => handleInputChange(e, 'auth')}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange(e, 'auth')}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-main  w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <div
        id="productModal"
        className="modal fade"
        tabIndex="-1"
        ref={productModalRef}
      >
        <div className="modal-dialog modal-xl ">
          <div className="modal-content border-0 custom-modal text-start">
            <div className="modal-header text-white">
              <h5 id="productModalLabel" className="modal-title">
                <span>{modalMode === 'add' ? '新增產品' : '編輯產品'}</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body custom-modal-content">
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-3">
                      <label htmlFor="imageUrl" className="form-label">
                        輸入圖片網址
                      </label>
                      <input
                        id="imageUrl"
                        type="url"
                        className="form-control rounded-pill"
                        placeholder="請輸入圖片連結"
                        value={newProductData.imageUrl}
                        onChange={(e) => handleInputChange(e, 'product')}
                      />
                    </div>
                  </div>
                  <div className="d-flex mb-3">
                    <button
                      className="btn btn-main primary-bg rounded-pill w-100 me-2"
                      onClick={() => setPreImageUrl(newProductData.imageUrl)}
                    >
                      預覽圖片
                    </button>
                  </div>
                  {modalMode === 'add' ? (
                    <img src={preImageUrl} alt="" />
                  ) : (
                    <img
                      src={newProductData.imageUrl}
                      alt={newProductData.title}
                    />
                  )}
                </div>
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      id="title"
                      type="text"
                      className="form-control rounded-pill"
                      placeholder="請輸入標題"
                      value={newProductData.title}
                      onChange={(e) => handleInputChange(e, 'product')}
                    />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">
                        分類
                      </label>
                      <input
                        id="category"
                        type="text"
                        className="form-control rounded-pill"
                        placeholder="請輸入分類"
                        value={newProductData.category}
                        onChange={(e) => handleInputChange(e, 'product')}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">
                        單位
                      </label>
                      <input
                        id="unit"
                        type="text"
                        className="form-control rounded-pill"
                        placeholder="請輸入單位"
                        value={newProductData.unit}
                        onChange={(e) => handleInputChange(e, 'product')}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        id="origin_price"
                        type="number"
                        min="0"
                        className="form-control rounded-pill"
                        placeholder="請輸入原價"
                        value={newProductData.origin_price}
                        onChange={(e) => handleInputChange(e, 'product')}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        id="price"
                        type="number"
                        min="0"
                        className="form-control rounded-pill"
                        placeholder="請輸入售價"
                        value={newProductData.price}
                        onChange={(e) => handleInputChange(e, 'product')}
                      />
                    </div>
                  </div>
                  <hr />

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      id="description"
                      className="form-control rounded-pill"
                      placeholder="請輸入產品描述"
                      value={newProductData.description}
                      onChange={(e) => handleInputChange(e, 'product')}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      id="content"
                      className="form-control rounded-pill"
                      placeholder="請輸入說明內容"
                      value={newProductData.content}
                      onChange={(e) => handleInputChange(e, 'product')}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                        checked={newProductData.is_enabled}
                        onChange={(e) => handleInputChange(e, 'product')}
                      />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary btn-main rounded-pill"
                data-bs-dismiss="modal"
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-main primary-bg rounded-pill"
                onClick={handleUpdateProduct}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
