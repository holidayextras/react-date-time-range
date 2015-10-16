var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

var expect = require('chai').expect;
var sinon = require('sinon');

var shallowRender = require('react-shallow-render');

// The return value of React.Children.map doesn't appear to be an array...
// Possibly a bug, possibly we need React.Children.toArray from React 0.14
var _convertChildPropsToArray = function(childrenProp) {
  var children = [];

  React.Children.forEach(childrenProp, function(child) {
    children.push(child);
  });

  return children;
};

describe('DateTimeRange', function() {
  var clock, DateTimeRange, DateTimeGroup;

  before(function() {
    clock = sinon.useFakeTimers(new Date(2015, 5, 6).valueOf());

    // getDefaultProps contains a date and is called when the component
    // is defined - we need to ensure the current date is faked by then.
    DateTimeRange = require('../src/DateTimeRange');
    DateTimeGroup = require('react-date-time-group');
  });

  after(function() {
    clock.restore();
  });

  it('is a component', function() {
    expect(TestUtils.isElement(<DateTimeRange />)).to.equal(true);
  });

  describe('props', function() {
    it('sets some defaults', function() {
      var element = <DateTimeRange />;

      expect(element.props).to.deep.equal({
        duration: 10,
        start: new Date(2015, 5, 6)
      });
    });
  });

  describe('render', function() {
    context('when given less than two child DateTimeGroup elements', function() {
      it('throws an exception', function() {
        expect(function() {
          var renderOutput = shallowRender(<DateTimeRange><div /></DateTimeRange>);
        }).to.throw(Error);
      });
    });

    context('when given more than two child DateTimeGroup elements', function() {
      it('throws an exception', function() {
        expect(function() {
          var renderOutput = shallowRender(
            <DateTimeRange>
              <DateTimeGroup />
              <DateTimeGroup />
              <DateTimeGroup />
            </DateTimeRange>
          );
        }).to.throw(Error);
      });
    });

    context('when given exactly two child DateTimeGroup elements', function() {
      var startDate = new Date(2015, 5, 6);
      var endDate = new Date(2015, 5, 20);
      var children;

      context('and an end date', function() {
        beforeEach(function() {
          var renderOutput = shallowRender(
            <DateTimeRange start={startDate} end={endDate}>
              <DateTimeGroup />
              <DateTimeGroup />
            </DateTimeRange>
          );

          children = _convertChildPropsToArray(renderOutput.props.children);
        });

        it('attaches change listeners to the child elements', function() {
          expect(children[0].props.onChange).to.be.a('function');
          expect(children[1].props.onChange).to.be.a('function');
        });

        it('passes values to the child elements', function() {
          expect(children[0].props.value).to.deep.equal(startDate);
          expect(children[1].props.value).to.deep.equal(endDate);
        });

        it('constrains the end date to be after the start date', function() {
          expect(children[1].props.dateStart).to.deep.equal(startDate);
        });
      });

      context('and a duration', function() {
        beforeEach(function() {
          var renderOutput = shallowRender(
            <DateTimeRange start={startDate} duration={4}>
              <DateTimeGroup />
              <h2>end date</h2>
              <DateTimeGroup />
            </DateTimeRange>
          );

          children = _convertChildPropsToArray(renderOutput.props.children);
        });

        it('attaches change listeners to the child elements', function() {
          expect(children[0].props.onChange).to.be.a('function');
          expect(children[2].props.onChange).to.be.a('function');
        });

        it('passes values to the child elements', function() {
          expect(children[0].props.value).to.deep.equal(startDate);
          expect(children[2].props.value).to.deep.equal(new Date(2015, 5, 10));
        });

        it('constrains the end date to be after the start date', function() {
          expect(children[2].props.dateStart).to.deep.equal(startDate);
        });
      });

      context('and an end date, but no start date', function() {
        beforeEach(function() {
          var renderOutput = shallowRender(
            <DateTimeRange end={endDate}>
              <DateTimeGroup />
              <DateTimeGroup />
            </DateTimeRange>
          );

          children = _convertChildPropsToArray(renderOutput.props.children);
        });

        it('constrains the end date to be after the current (stubbed) day', function() {
          expect(children[1].props.dateStart).to.deep.equal(new Date(2015, 5, 6));
        });
      });

      context('and an end date, where the child has a start date before the start date', function() {
        beforeEach(function() {
          var renderOutput = shallowRender(
            <DateTimeRange start={startDate} end={endDate}>
              <DateTimeGroup />
              <DateTimeGroup dateStart={new Date(2015, 5, 3)} />
            </DateTimeRange>
          );

          children = _convertChildPropsToArray(renderOutput.props.children);
        });

        it('constrains the end date to be after the parent start date', function() {
          expect(children[1].props.dateStart).to.deep.equal(startDate);
        });
      });

      context('and an end date, where the child has a start date after the start date', function() {
        beforeEach(function() {
          var renderOutput = shallowRender(
            <DateTimeRange start={startDate} end={endDate}>
              <DateTimeGroup />
              <DateTimeGroup dateStart={new Date(2015, 5, 10)} />
            </DateTimeRange>
          );

          children = _convertChildPropsToArray(renderOutput.props.children);
        });

        it('constrains the end date to be after the child start date', function() {
          expect(children[1].props.dateStart).to.deep.equal(new Date(2015, 5, 10));
        });
      });
    });
  });

  describe('events', function() {
    context('with no end date', function() {
      var handler, changeStartDate, changeEndDate;

      beforeEach(function() {
        handler = sinon.stub();
        var doc = TestUtils.renderIntoDocument(
          <DateTimeRange onChange={handler} start={new Date(2015, 5, 6)}>
            <DateTimeGroup />
            <DateTimeGroup />
          </DateTimeRange>
        );

        var components = TestUtils.scryRenderedComponentsWithType(doc, DateTimeGroup);
      
        changeStartDate = components[0].props.onChange;
        changeEndDate = components[1].props.onChange;
      });

      context('when you change the start date', function() {
        it('emits up the changed start date but no end date', function() {
          changeStartDate(new Date(2015, 5, 6, 16, 30, 0, 0));

          sinon.assert.calledWith(handler, new Date(2015, 5, 6, 16, 30, 0, 0), undefined);
        });
      });

      context('when you change the end date', function() {
        it('emits up the passed in start date and the changed end date', function() {
          changeEndDate(new Date(2015, 6, 7, 11, 45, 0, 0));

          sinon.assert.calledWith(handler, new Date(2015, 5, 6), new Date(2015, 6, 7, 11, 45, 0, 0));
        });
      });
    });

    context('with an end date', function() {
      var handler, changeStartDate, changeEndDate;

      beforeEach(function() {
        handler = sinon.stub();
        var doc = TestUtils.renderIntoDocument(
          <DateTimeRange onChange={handler} start={new Date(2015, 5, 6)} end={new Date(2015, 5, 20)}>
            <DateTimeGroup />
            <DateTimeGroup />
          </DateTimeRange>
        );

        var components = TestUtils.scryRenderedComponentsWithType(doc, DateTimeGroup);
      
        changeStartDate = components[0].props.onChange;
        changeEndDate = components[1].props.onChange;
      });

      context('when you change the start date', function() {
        it('emits up the changed start date and the passed in end date', function() {
          changeStartDate(new Date(2015, 5, 11, 16, 30, 0, 0));

          sinon.assert.calledWith(handler, new Date(2015, 5, 11, 16, 30, 0, 0), new Date(2015, 5, 20));
        });
      });

      context('when you change the end date', function() {
        it('emits up the passed in start date and the changed end date', function() {
          changeEndDate(new Date(2015, 5, 22, 16, 30, 0, 0));

          sinon.assert.calledWith(handler, new Date(2015, 5, 6), new Date(2015, 5, 22, 16, 30, 0, 0));
        });
      });
    });
  });
});
