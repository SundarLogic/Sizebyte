const Product = require("../Models/Product");

const Cart = require("../Models/Cart");
const CartItem = require("../Models/CartItem");

const isValidQuantity = (quantity) => Number.isInteger(quantity) && quantity > 0;

exports.addCart = async (req, res, next) => {
  const productId = req.body.productId;
  const quantity = Number(req.body.quantity);
  try {
    const product = await Product.findByPk(productId);

    //check whether the product exists
    if (!product) {
      return res.status(404).json({
        message: "Product is not avilable",
      });
    }

    if (!isValidQuantity(quantity)) {
      //check the quantity entered is valid
      return res.status(400).json({
        message: "Quantity must be a whole number greater than 0",
      });
    }

    if (quantity > product.quantity) {
      //check is stock avilable
      return res.status(400).json({
        message: "Not enough Stock available",
      });
    }
    let cart = await Cart.findOne({
      //Finding cart avilable or not using the userId
      where: {
        userId: req.userId,
      },
    });
    if (!cart) {
      cart = await Cart.create({
        //if not available create one
        userId: req.userId,
      });
    }
    //then find whether cartitem is availbale or not
    const cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });
    if (!cartItem) {
      //if cartitem is not available create one
      await CartItem.create({
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
      });

      return res.status(200).json({
        message: "Product added to cart",
      });
    }
    //checking whether the extra qunatity added is not affecting the stock avilable
    const newQuantity = cartItem.quantity + quantity;

    if (newQuantity > product.quantity) {
      return res.status(400).json({
        message: "Not enough quantity available",
      });
    }
    //if cartitem is avilable then increase the quantity
    cartItem.quantity = cartItem.quantity + quantity;

    await cartItem.save();

    res.status(200).json({
      message: "Product added to cart",
    });
  } catch (err) {
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  const userId = req.userId;

  try {
    const cart = await Cart.findOne({
      where: {
        userId: userId,
      },
    });

    if (!cart) {
      return res.status(200).json({
        cart: null,
        cartItems: [],
      });
    }

    const allCartItems = await CartItem.findAll({
      where: {
        cartId: cart.id,
      },
      attributes: ["id", "productId", "quantity"],
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "imageUrl"],
        },
      ],
    });

    //Drop items whose product was deleted by the seller
    const cartItems = allCartItems.filter((item) => item.product);
    const removedItemIds = allCartItems
      .filter((item) => !item.product)
      .map((item) => item.id);

    if (removedItemIds.length > 0) {
      await CartItem.destroy({
        where: {
          id: removedItemIds,
        },
      });
    }

    return res.status(200).json({
      cart: cart,
      cartItems: cartItems,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCart = async (req, res, next) => {
  const userId = req.userId;
  const productId = req.body.productId;
  const quantity = Number(req.body.quantity);

  try {
    const cart = await Cart.findOne({
      where: {
        userId: userId,
      },
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart is not available",
      });
    }

    const cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Item is not avilable",
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product is not available",
      });
    }

    if (!isValidQuantity(quantity)) {
      return res.status(400).json({
        message: "Quantity must be a whole number greater than 0",
      });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({
        message: "Stock not available",
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({
      message: "Cart quantity updated",
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCart = async (req, res, next) => {
  const userId = req.userId;
  const productId = req.body.productId;

  try {
    const cart = await Cart.findOne({
      where: {
        userId: userId,
      },
    });
    if (!cart) {
      return res.status(404).json({
        message: "Cart is not availbale",
      });
    }

    const cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });
    if (!cartItem) {
      return res.status(404).json({
        message: "Item is not available",
      });
    }
    await cartItem.destroy();

    return res.status(200).json({
      message: "Product removed from Cart",
    });
  } catch (err) {
    next(err);
  }
};
