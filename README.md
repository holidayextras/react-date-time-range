# react-date-time-range

[React](https://facebook.github.io/react/) Component implementing a range by wrapping two [date-time-group](https://github.com/holidayextras/react-date-time-group)s.

```
var DateTimeRange = require('react-date-time-range');
var DateTimeGroup = require('react-date-time-group');

React.render((
  <DateTimeRange onChange={console.log.bind(console)}>
    <DateTimeGroup />
    <DateTimeGroup />
  </DateTimeRange>
), document.getElementById('container'));
```

## Options

- __start__ - Date instance representing the start of the range
- __end__ - Date instance representing the end of the range. If it is not provided, the end date will automatically move __duration__ days ahead of the start date when the start date is changed.
- __duration__ - This is the number of days ahead of the start date the end date will move to when the start date is changed, if an end date is not passed in. Defaults to 10.
- __onChange__ - Event handler for when the start or end of the range is changed. It will be passed two date instances, or if the start date is changed without an end date having been provided, the start date and undefined.

### More options

- You can pass all accepted options except for __onChange__ to the child [DateTimeGroup](https://github.com/holidayextras/react-date-time-group#options) elements.

## Developing

Clone the repo and `npm install`.

`npm start` will create and watchify an example which you can open in your browser, at `doc/example.html`

`npm test` for the unit tests.

`npm run lint` checks the code against our [guidelines](https://github.com/holidayextras/culture/blob/master/.eslintrc)

`npm run coverage` gets coverage with istanbul, outputing to the `coverage` directory, and exiting nonzero if any metric is below 100%.
