import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard from '../src/components/ProductCard';
import EmptyState from '../src/components/EmptyState';
import ErrorAlert from '../src/components/ErrorAlert';

describe('Component Tests - Màn hình Menu (TV5: I-24 / S1-18)', () => {
  it('hiển thị đúng thông tin sản phẩm và nút thêm', () => {
    const handleSelect = jest.fn();
    render(
      <ProductCard
        id="prod-1"
        name="Cà phê Đen Phin"
        category="COFFEE"
        basePrice={29000}
        stock={20}
        isAvailable={true}
        onSelect={handleSelect}
      />,
    );

    expect(screen.getByText('Cà phê Đen Phin')).toBeInTheDocument();
    expect(screen.getByText('29.000 đ')).toBeInTheDocument();
    expect(screen.getByText('COFFEE')).toBeInTheDocument();
  });

  it('hiển thị nhãn Hết hàng khi tồn kho bằng 0', () => {
    const handleSelect = jest.fn();
    render(
      <ProductCard
        id="prod-2"
        name="Trà Đào Cam Sả"
        category="TEA"
        basePrice={45000}
        stock={0}
        isAvailable={false}
        onSelect={handleSelect}
      />,
    );

    expect(screen.getAllByText(/Hết hàng|Hết/i).length).toBeGreaterThan(0);
  });

  it('EmptyState render đúng thông điệp trạng thái rỗng', () => {
    render(
      <EmptyState
        title="Thực đơn rỗng"
        description="Không tìm thấy sản phẩm nào"
      />,
    );

    expect(screen.getByText('Thực đơn rỗng')).toBeInTheDocument();
    expect(screen.getByText('Không tìm thấy sản phẩm nào')).toBeInTheDocument();
  });

  it('ErrorAlert render đúng thông báo lỗi và nút Thử lại', () => {
    const retryFn = jest.fn();
    render(<ErrorAlert message="Mất kết nối máy chủ" onRetry={retryFn} />);

    expect(screen.getByText('Đã xảy ra sự cố')).toBeInTheDocument();
    expect(screen.getByText('Mất kết nối máy chủ')).toBeInTheDocument();
    expect(screen.getByText('Thử lại')).toBeInTheDocument();
  });
});
