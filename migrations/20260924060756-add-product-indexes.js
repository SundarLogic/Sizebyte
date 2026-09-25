"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  //asyn up for new migration setup
  /*
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("products", ["category"], {
      name: "idx_products_category",
    });

    await queryInterface.addIndex("products", ["price"], {
      name: "idx_products_price",
    });

    await queryInterface.addIndex("products", ["createdAt"], {
      name: "idx_products_createdAt",
    });

    await queryInterface.addIndex("products", ["name"], {
      name: "idx_products_name",
    });

    await queryInterface.addIndex("products", ["category", "createdAt"], {
      name: "idx_products_category_createdAt",
    });

    await queryInterface.addIndex("products", ["name"], {
      name: "ft_products_name",
      type: "FULLTEXT",
    });
  },
  */
  async up(queryInterface, Sequelize) {
    const indexes = await queryInterface.showIndex("products");

    const indexNames = indexes.map((index) => index.name);
    //check whether the indexing already applied or not
    if (!indexNames.includes("idx_products_category")) {
      await queryInterface.addIndex("products", ["category"], {
        name: "idx_products_category",
      });
    }

    if (!indexNames.includes("idx_products_price")) {
      await queryInterface.addIndex("products", ["price"], {
        name: "idx_products_price",
      });
    }

    if (!indexNames.includes("idx_products_createdAt")) {
      await queryInterface.addIndex("products", ["createdAt"], {
        name: "idx_products_createdAt",
      });
    }

    if (!indexNames.includes("idx_products_name")) {
      await queryInterface.addIndex("products", ["name"], {
        name: "idx_products_name",
      });
    }

    if (!indexNames.includes("idx_products_category_createdAt")) {
      await queryInterface.addIndex("products", ["category", "createdAt"], {
        name: "idx_products_category_createdAt",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("products", "idx_products_category");

    await queryInterface.removeIndex("products", "idx_products_price");

    await queryInterface.removeIndex("products", "idx_products_createdAt");

    await queryInterface.removeIndex("products", "idx_products_name");

    await queryInterface.removeIndex(
      "products",
      "idx_products_category_createdAt",
    );
  },
};
