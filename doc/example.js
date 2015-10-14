'use strict';

var React = require('react');
var DateTimeRange = require('../src/DateTimeRange.jsx');
var DateTimeGroup = require('react-date-time-group');

var Example = React.createClass({
  render: function() {
    return (
      <div className="container">
        <div className="jumbotron">
          <h1>Date Time Range</h1>
        </div>

        <h2>Basic example</h2>
        <DateTimeRange>
          <DateTimeGroup />
          <DateTimeGroup />
        </DateTimeRange>
      </div>
    );
  }
});

React.render(<Example />, document.getElementById('container'));
