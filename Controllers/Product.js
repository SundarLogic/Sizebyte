const Product = require("../Models/Product");
const CartItem = require("../Models/CartItem");

const { Op, Sequelize } = require("sequelize");

const cloudinary = require("../config/cloudinary");

const uploadImage = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "sizebyte/products",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(buffer);
  });
};

exports.getProducts = async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const offset = (page - 1) * limit;

  const search = req.query.search || "";

  const category = req.query.category;

  const minPrice = req.query.minPrice;
  const maxPrice = req.query.maxPrice;

  const sort = req.query.sort || "createdAt";
  const order = req.query.order === "desc" ? "DESC" : "ASC";

  const allowedSortFields = ["name", "price", "createdAt"];
  const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";

  const where = {};

  if (search) {
    where.name = {
      [Op.like]: `%${search}%`,
    };
  }

  if (category) {
    where.category = category;
  }

  if (minPrice && maxPrice) {
    where.price = {
      [Op.gte]: minPrice,
      [Op.lte]: maxPrice,
    };
  } else if (minPrice) {
    where.price = {
      [Op.gte]: minPrice,
    };
  } else if (maxPrice) {
    where.price = {
      [Op.lte]: maxPrice,
    };
  }

  try {
    const products = await Product.findAndCountAll({
      where: where,
      attributes: [
        "id",
        "name",
        "category",
        "description",
        "price",
        "quantity",
        "imageUrl",
      ],
      limit: limit,
      offset: offset,
      order: [[sortField, order]],
    });

    res.status(200).json({
      products: products.rows,
      total: products.count,
      page: page,
      limit: limit,
      totalPages: Math.ceil(products.count / limit),
    });
  } catch (err) {
    next(err);
  }
};

exports.addProduct = (req, res, next) => {
  const name = req.body.name;
  const category = req.body.category;
  const description = req.body.description;
  const price = req.body.price;
  const quantity = req.body.quantity;

  uploadImage(req.file.buffer)
    .then((result) => {
      const imageUrl = result.secure_url;
      const imagePublicId = result.public_id;

      return Product.create({
        name: name,
        category: category,
        description: description,
        price: price,
        quantity: quantity,
        imageUrl: imageUrl,
        imagePublicId: imagePublicId,
        adminId: req.adminId,
      });
    })
    .then((product) => {
      res.status(201).json({
        message: "Product is added",
        product: product,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    product.name = req.body.name;
    product.category = req.body.category;
    product.description = req.body.description;
    product.price = req.body.price;
    product.quantity = req.body.quantity;

    let oldImagePublicId = null;

    if (req.file) {
      //Upload the new image first so a failed upload keeps the old one
      const result = await uploadImage(req.file.buffer);

      oldImagePublicId = product.imagePublicId;
      product.imageUrl = result.secure_url;
      product.imagePublicId = result.public_id;
    }

    await product.save();

    if (oldImagePublicId) {
      cloudinary.uploader
        .destroy(oldImagePublicId, {
          resource_type: "image",
          invalidate: true,
        })
        .catch((err) => console.log(err));
    }

    res.status(200).json({
      message: "Product updated",
      product: product,
    });
  } catch (err) {
    next(err);
  }
};

//Soft delete: the image is kept because past orders still show this product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    await CartItem.destroy({
      where: {
        productId: product.id,
      },
    });

    await product.destroy();

    res.status(200).json({
      message: "Product Deleted",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: {
        adminId: req.adminId,
      },
      attributes: [
        "id",
        "name",
        "category",
        "description",
        "price",
        "quantity",
        "imageUrl",
      ],
    });

    res.status(200).json({
      products: products,
    });
  } catch (err) {
    next(err);
  }
};
