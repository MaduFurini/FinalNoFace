'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('produtos', 'id_referencia', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'produtos',
        key: 'id'
      },
      after: 'id'
    });

    await queryInterface.changeColumn('produtos', 'id_variacao', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('produtos', 'produtos_id_referencia_foreign_idx')

    await queryInterface.removeColumn('produtos', 'id_referencia');

    await queryInterface.changeColumn('produtos', 'id_variacao', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
