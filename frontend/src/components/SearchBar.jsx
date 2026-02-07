import React, { memo } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

/**
 * SearchBar Component
 * Allows users to search hostels by location and budget
 * Memoized for performance optimization
 */
const SearchBar = memo(({ searchTerm, setSearchTerm, budget, setBudget, onSearch }) => {
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
              <option value="0-2000">Under Ksh. 2,000</option>
              <option value="2000-3000">Ksh. 2,000 - Ksh. 3,000</option>
              <option value="3000-4000">Ksh. 3,000 - Ksh. 4,000</option>
              <option value="4000-5000">Ksh. 4,000 - Ksh. 5,000</option>
              <option value="5000-10000">Over Ksh. 5,000</option>
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
});

export default SearchBar;
