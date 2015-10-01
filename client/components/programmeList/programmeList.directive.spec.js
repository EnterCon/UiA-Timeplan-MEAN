'use strict';

describe('Directive: programmeList', function () {

  // load the directive's module
  beforeEach(module('uiAtimeplanApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<programme-list></programme-list>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the programmeList directive');
  }));
});