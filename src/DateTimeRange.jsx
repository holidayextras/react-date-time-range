'use strict';

var React = require('react');
var PropTypes = require('prop-types');

class DateTimeRange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      endDateShouldMoveAutomatically: (this.props.end === undefined)
    };
  }

  // Could this be made smarter? ie, detect components nested inside a <div>
  // inside this component, accept components based on an interface rather
  // than being of a certain type?
  identifyStartAndEndDateChildComponents() {
    var rangeStartComponent, rangeEndComponent;
    React.Children.forEach(this.props.children, function(child) {
      if (child.type.name === 'DateTimeGroup') {
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
  }

  getEndDate(startDate) {
    startDate = startDate || this.props.start;
    if (this.state.endDateShouldMoveAutomatically || startDate > this.props.end) {
      return this.assumedEndDate(startDate);
    }
    return this.props.end;
  }

  assumedEndDate(startDate) {
    var endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + this.props.duration);
    return endDate;
  }

  earliestDate(dateOne, dateTwo) {
    if (!dateTwo) {
      return dateOne;
    }

    return dateOne > dateTwo ? dateOne : dateTwo;
  }

  childrenWithAttachedBehaviour() {
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
              endDateShouldMoveAutomatically: false
            });
          },
          value: self.getEndDate(),
          dateStart: self.earliestDate(self.props.start, child.props.dateStart)
        });
      }

      return child;
    });
  }

  render() {
    return (<div>{this.childrenWithAttachedBehaviour()}</div>);
  }
}

DateTimeRange.propTypes = {
  start: PropTypes.instanceOf(Date),
  end: PropTypes.instanceOf(Date),
  duration: PropTypes.number,
  onChange: PropTypes.func,
  children: PropTypes.array
};

DateTimeRange.defaultProps = {
  duration: 10,
  start: new Date()
};

module.exports = DateTimeRange;
