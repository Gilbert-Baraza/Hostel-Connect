import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

/**
 * SearchBar Component
 * Allows users to search hostels by location and budget
 */
const SearchBar = ({ searchTerm, setSearchTerm, budget, setBudget, onSearch }) => {
  return (
    <div className="search-bar-container mb-4">
      <Form>
        <Row className="g-3">
          {/* Location Input */}
          <Col xs={12} md={5}>
            <Form.Control
              type="text"
              placeholder="Search by location, area, or hostel name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control-custom"
              aria-label="Search location"
            />
          </Col>

          {/* Budget Select */}
          <Col xs={12} md={4}>
            <Form.Select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="form-select-custom"
              aria-label="Select budget range"
            >
              <option value="">All Budgets</option>
              <option value="0-10000">Under ₦10,000</option>
              <option value="10000-15000">₦10,000 - ₦15,000</option>
              <option value="15000-20000">₦15,000 - ₦20,000</option>
              <option value="20000-999999">Over ₦20,000</option>
            </Form.Select>
          </Col>

          {/* Search Button */}
          <Col xs={12} md={3}>
            <Button
              variant="primary"
              className="btn-search w-100"
              onClick={onSearch}
              type="button"
            >
              <i className="bi bi-search me-2"></i>
              Search
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default SearchBar;
