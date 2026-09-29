const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// GET /loans (Mendukung query parameter: ?status=Terlambat, ?member_name=..., ?book_title=..., ?search=...)
router.get('/', loanController.getAllLoans);

// GET /loans/:id
router.get('/:id', loanController.getLoanById);

// POST /loans
router.post('/', loanController.createLoan);

// PUT /loans/:id (Full update / replace)
router.put('/:id', loanController.updateLoan);

// PATCH /loans/:id (Partial update)
router.patch('/:id', loanController.updateLoan);

// DELETE /loans/:id
router.delete('/:id', loanController.deleteLoan);

module.exports = router;
