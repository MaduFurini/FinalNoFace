'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('usuarios', [
      {
        nome: 'Administrador',
        cpf: 0,
        email: 'staynofaround@gmail.com',
        senha: '$2b$10$RG7604mC.oJSN7diC7I7Auv/MlaGsvCVAkVz9BHd2c/cTK4yPyNB.',
        tipo_usuario: 'admin',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
