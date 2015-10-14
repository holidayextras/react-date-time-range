var React = require('react');

var DateTimeRange = React.createClass({
  render: function() {
    return (<div>{this.props.children}</div>);
  }
});

module.exports = DateTimeRange;