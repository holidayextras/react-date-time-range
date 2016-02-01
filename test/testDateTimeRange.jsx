'use strict';

var React = require('react');
var TestUtils = require('react-addons-test-utils');

var expect = require('chai')
.use(require('dirty-chai')).expect;

var sinon = require('sinon');

var { shallow, mount } = require('enzyme');

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
          shallow(
            <DateTimeRange>
              <DateTimeGroup/>
            </DateTimeRange>
          );
        }).to.throw(Error);
      });
    });

    context('when given more than two child DateTimeGroup elements', function() {
      it('throws an exception', function() {
        expect(function() {
          shallow(
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
      var dateTimeRange;
      context('and an end date', function() {
        var props;
        beforeEach(function() {
          props = {
            start: new Date(2015, 5, 6),
            end: new Date(2015, 5, 20)
          };

          dateTimeRange = mount(
            <DateTimeRange {...props}>
              <DateTimeGroup />
              <DateTimeGroup />
            </DateTimeRange>
          );
        });

        it('attaches change listeners to the child elements', function() {
          expect(dateTimeRange.find(DateTimeGroup).at(0).props().onChange).to.be.a('function');
          expect(dateTimeRange.find(DateTimeGroup).at(1).props().onChange).to.be.a('function');
        });

        it('passes values to the child elements', function() {
          expect(dateTimeRange.find(DateTimeGroup).at(0).props().value).to.deep.equal(props.start);
          expect(dateTimeRange.find(DateTimeGroup).at(1).props().value).to.deep.equal(props.end);
        });

        it('constrains the end date to be after the start date', function() {
          expect(dateTimeRange.find(DateTimeGroup).at(1).props().value).to.deep.equal(props.end);
        });
      });

      context('and a duration', function() {
        var props;
        beforeEach(function() {
          props = {
            start: new Date(2015, 5, 6),
            end: new Date(2015, 5, 20),
            duration: 6
          };

          dateTimeRange = mount(
            <DateTimeRange {...props}>
              <DateTimeGroup />
              <h2>end date</h2>
              <DateTimeGroup />
            </DateTimeRange>

          );
        });

        it('attaches change listeners to the child elements', function() {
          expect(dateTimeRange.find(DateTimeGroup).at(0).props().onChange).to.be.a('function');
          expect(dateTimeRange.find(DateTimeGroup).at(1).props().onChange).to.be.a('function');
        });

        it('passes values to the child elements', function() {
          expect(dateTimeRange.find(DateTimeGroup).at(0).props().value).to.deep.equal(props.start);
          expect(dateTimeRange.find(DateTimeGroup).at(1).props().value).to.deep.equal(props.end);
        });

        it('constrains the end date to be after the start date', function() {
          expect(dateTimeRange.find(DateTimeGroup).at(0).props().value).to.deep.equal(props.start);
        });

        it('the duration we have passed in match what we pass the our shallow component', function() {
          expect(dateTimeRange.at(0).props().duration).to.equal(props.duration);
        });
      });

      context('and an end date, but no start date', function() {
        var props;
        beforeEach(function() {
          props = {
            end: new Date(2015, 5, 20)
          };
          dateTimeRange = mount(
            <DateTimeRange {...props}>
              <DateTimeGroup />
              <DateTimeGroup />
            </DateTimeRange>
          );
        });

        it('constrains the end date to be after the current (stubbed) day', function() {
          expect(dateTimeRange.find(DateTimeGroup).at(1).props().dateStart).to.deep.equal(new Date(2015, 5, 6));
        });
      });

      context('and an end date, where the child has a start date before the start date', function() {
        var props;
        beforeEach(function() {
          props = {
            start: new Date(2015, 5, 6),
            end: new Date(2015, 5, 20)
          };

          dateTimeRange = mount(
            <DateTimeRange {...props}>
              <DateTimeGroup />
              <DateTimeGroup dateStart={new Date(2015, 5, 3)} />
            </DateTimeRange>
          );
        });

        it('constrains the end date to be after the parent start date', function() {
          expect(dateTimeRange.find(DateTimeGroup).at(1).props().dateStart).to.deep.equal(props.start);
        });
      });

      context('and an end date, where the child has a start date after the start date', function() {
        var props;
        beforeEach(function() {
          props = {
            start: new Date(2015, 5, 6),
            end: new Date(2015, 5, 20)
          };

          dateTimeRange = mount(
            <DateTimeRange {...props}>
              <DateTimeGroup />
              <DateTimeGroup dateStart={new Date(2015, 5, 10)} />
            </DateTimeRange>
          );
        });

        it('constrains the end date to be after the child start date', function() {
          expect(dateTimeRange.find(DateTimeGroup).at(1).props().dateStart).to.deep.equal(new Date(2015, 5, 10));
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
