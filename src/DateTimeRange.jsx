'use strict';

var React = require('react');

var DateTimeRange = React.createClass({
  propTypes: {
    start: React.PropTypes.instanceOf(Date),
    end: React.PropTypes.instanceOf(Date),
    duration: React.PropTypes.number,
    onChange: React.PropTypes.func,
    children: React.PropTypes.array
  },

  getDefaultProps: function() {
    return {
      duration: 10,
      start: new Date()
    };
  },

  getInitialState: function() {
    return {
      overrideEndDate: !(this.props.end === undefined),
      endDateHasChanged: false
    };
  },

  // Could this be made smarter? ie, detect components nested inside a <div>
  // inside this component, accept components based on an interface rather
  // than being of a certain type?
  identifyStartAndEndDateChildComponents: function() {
    var rangeStartComponent, rangeEndComponent;
    React.Children.forEach(this.props.children, function(child) {
      if (child.type.displayName === 'DateTimeGroup') {
        if (!rangeStartComponent) {
          rangeStartComponent = child;
          return;
        }

        if (!rangeEndComponent) {
          rangeEndComponent = child;
          return;
        }

        throw new Error('Expected exactly two DateTimeGroup child components of DateTimeRange, but got more');
      }
    });

    if (!rangeStartComponent || !rangeEndComponent) {
      throw new Error('Expected exactly two DateTimeGroup child components of DateTimeRange, but got less');
    }

    return {
      start: rangeStartComponent,
      end: rangeEndComponent
    };
  },

  getEndDate: function(startDate) {
    startDate = startDate || this.props.start;
    if ((!this.state.overrideEndDate && !this.state.endDateHasChanged) || startDate > this.props.end) {
      return this.assumedEndDate(startDate);
    }
    return this.props.end;
  },

  assumedEndDate: function(startDate) {
    var endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + this.props.duration);
    return endDate;
  },

  earliestDate: function(dateOne, dateTwo) {
    if (!dateTwo) {
      return dateOne;
    }

    return dateOne > dateTwo ? dateOne : dateTwo;
  },

  childrenWithAttachedBehaviour: function() {
    var startAndEnd = this.identifyStartAndEndDateChildComponents();
    var self = this;

    return React.Children.map(this.props.children, function(child) {
      if (child === startAndEnd.start) {
        return React.cloneElement(child, {
          onChange: function(newDate) {
            self.props.onChange(newDate, self.getEndDate(newDate));
          },
          value: self.props.start
        });
      }

      if (child === startAndEnd.end) {
        return React.cloneElement(child, {
          onChange: function(newDate) {
            self.props.onChange(self.props.start, newDate);
            self.setState({
              endDateHasChanged: true
            });
          },
          value: self.getEndDate(),
          dateStart: self.earliestDate(self.props.start, child.props.dateStart)
        });
      }

      return child;
    });
  },

  render: function() {
    return (<div>{this.childrenWithAttachedBehaviour()}</div>);
  }
});

module.exports = DateTimeRange;
