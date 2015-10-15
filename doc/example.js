'use strict';

var React = require('react');
var DateTimeRange = require('../src/DateTimeRange.jsx');
var DateTimeGroup = require('react-date-time-group');

var Example = React.createClass({
  getInitialState: function() {
    return {
      firstRange: {
        // With no end, the end will be defaulted x days in the future.
        // If the user picks an end date, the end will only be moved
        // if it's no longer valid given the start... ??? ..?
        // And we can push the start back up into shared state at the engine level
        // if needed.
        // Remember to delete all these comments talking about usage specifics
        start: new Date(),
        duration: 8
      },
      secondRange: {
        start: new Date(2015, 8, 9, 14, 30),
        end: new Date(2015, 8, 20, 11, 15)
      }
    };
  },

  changeFirstExample: function(start, end) {
    this.setState({
      firstRange: {
        start: start,
        end: end
      }
    });
  },

  changeSecondExample: function(start, end) {
    this.setState({
      secondRange: {
        start: start,
        end: end
      }
    });
  },

  render: function() {
    return (
      <div className="container">
        <div className="jumbotron">
          <h1>Date Time Range</h1>
        </div>

        <h2>Basic example</h2>
        <DateTimeRange start={this.state.firstRange.start} end={this.state.firstRange.end} duration={6} onChange={this.changeFirstExample}>
          <DateTimeGroup />
          <DateTimeGroup />
        </DateTimeRange>

        <h2>Overriding settings</h2>
        <DateTimeRange start={this.state.secondRange.start} end={this.state.secondRange.end} onChange={this.changeSecondExample}>
          <DateTimeGroup
            dateLabel="Start Date"
            timeLabel="Start Time"
            dateStart={new Date(2015, 8, 1)}
            dateEnd={new Date(2015, 8, 14)}
            dateExclusions={[new Date(2015, 8, 5), new Date(2015, 8, 6), new Date(2015, 8, 12), new Date(2015, 8, 13)]}
            timeName="StartTime" />
          <DateTimeGroup
            dateLabel="End Date"
            timeLabel="End Time"
            dateStart={new Date(2015, 8, 19)}
            dateEnd={new Date(2015, 8, 26)}
            timeStart={900}
            timeEnd={1800}
            timeStep={15}
            timeClassName="foo"
            timeName="EndTime" />
        </DateTimeRange>
        <ul>
          <li>an "end" prop is passed in, so the end date will not automatically fast-forward if the start date changes</li>
        </ul>
      </div>
    );
  }
});

React.render(<Example />, document.getElementById('container'));
