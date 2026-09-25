const Product = require("../Models/Product");

const { Op, Sequelize } = require("sequelize");

const cloudinary = require("../config/cloudinary");

exports.getProducts = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
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
    where[Sequelize.Op.and] = Sequelize.literal(
      `MATCH(name) AGAINST ('${search}')`,
    );
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

  new Promise((resolve, reject) => {
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

    stream.end(req.file.buffer);
  })
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

exports.updateProduct = (req, res, next) => {
  const name = req.body.name;
  const category = req.body.category;
  const description = req.body.description;
  const price = req.body.price;
  const quantity = req.body.quantity;

  Product.findByPk(req.params.id)
    .then((product) => {
      product.name = name;
      product.category = category;
      product.description = description;
      product.price = price;
      product.quantity = quantity;

      if (req.file) {
        //product.imageUrl = req.file.filename;
        return cloudinary.uploader
          .destroy(product.imagePublicId, {
            resource_type: "image",
            invalidate: true,
          })
          .then(() => {
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

              stream.end(req.file.buffer);
            });
          })
          .then((result) => {
            product.imageUrl = result.secure_url;

            return product.save();
          });
      }

      return product.save();
    })
    .then((product) => {
      res.status(200).json({
        message: "Product updated",
        product: product,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  Product.findByPk(req.params.id)
    .then((product) => {
      return cloudinary.uploader.destroy(product.imagePublicId, {
        resource_type: "image",
        invalidate: true,
      });
    })
    .then(() => {
      return Product.findByPk(req.params.id);
    })
    .then((product) => {
      return product.destroy();
    })
    .then(() => {
      res.status(200).json({
        message: "Product Deleted",
      });
    })
    .catch((err) => {
      next(err);
    });
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
