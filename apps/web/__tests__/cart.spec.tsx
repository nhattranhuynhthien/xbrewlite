import React from 'react';
import { render, screen } from '@testing-library/react';
import { CartProvider, useCart } from '../src/context/CartContext';

function CartTestConsumer() {
  const { items, addItem, updateQuantity, removeItem, totalAmount } = useCart();

  return (
    <div>
      <div data-testid="cart-total">{totalAmount}</div>
      <div data-testid="cart-count">{items.length}</div>
      <button
        onClick={() =>
          addItem({
            productId: 'p-1',
            name: 'Trà Sữa Oolong',
            sizeCode: 'M',
            sizeName: 'Vừa',
            toppings: [{ id: 'top-1', name: 'Trân châu', price: 10000 }],
            unitPrice: 50000,
            quantity: 2,
          })
        }
      >
        Thêm món
      </button>
    </div>
  );
}

describe('Component Tests - Giỏ hàng (TV5: I-39 / S2-20)', () => {
  it('giỏ hàng ban đầu rỗng với tổng tiền bằng 0', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>,
    );

    expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });
});
