/// <reference path="../external/DefinitelyTyped/knockout.rx/knockout.rx.d.ts"/>
/// <reference path="../external/DefinitelyTyped/requirejs/require.d.ts"/>

(function (factory) {
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        factory(require("rx"), require("knockout"));
    } else if (typeof define === "function" && define["amd"]) {
        define(["rx", "knockout"], factory);
    } else {
        factory(Rx, ko);
    }
}(function (rx, ko) {
    var rxObservableProto = rx.Observable.prototype;

    function noop() {
    }

    function ko2rx(event) {
        var _this = this;
        // KnockoutSubscription implements Rx._IDisposable
        return rx.Observable.createWithDisposable(function (observer) {
            return _this.subscribe(observer.onNext, observer, event);
        });
    }

    function ko2rxReply(event) {
        var _this = this;
        return rx.Observable.createWithDisposable(function (observer) {
            observer.onNext(_this.peek());
            return _this.subscribe(observer.onNext, observer, event);
        });
    }

    function ko2rxSubject() {
        var observable = this;
        return rx.Subject.create(rx.Observer.create(function (value) {
            return observable(value);
        }), observable.toObservable());
    }

    function rx2koSubscribable() {
        var _this = this;
        var subscribable = new ko.subscribable();
        var subscriptionCount = 0;

        subscribable.subscribe = function (callback, target, event) {
            var observer = (!event || event == "change" || event == "onNext") ? Rx.Observer.create(callback) : (event == "onError" || event == "error") ? Rx.Observer.create(noop, callback) : (event == "onCompleted" || event == "complete") ? Rx.Observer.create(noop, noop, callback) : null;

            if (!observer)
                throw new Error("Unknown event '" + event + "'");

            subscriptionCount++;
            var disposable = _this.subscribe(observer) || Rx.Disposable.empty;
            return {
                dispose: function () {
                    if (disposable) {
                        disposable.dispose();
                        disposable = null;
                        subscriptionCount--;
                    }
                }
            };
        };

        subscribable.getSubscriptionsCount = function () {
            return subscriptionCount;
        };

        return subscribable;
    }

    function rx2koObservable(initialValue) {
        var observable = ko.observable(initialValue);
        this.subscribe(observable);
        return observable;
    }

    function rxSubject2koObservable(initialValue) {
        var subject = this;
        var observable = ko.observable(initialValue);
        var changingBySubject = false;

        observable.subscribe(function (value) {
            return !changingBySubject && subject.onNext(value);
        });
        subject.subscribe(function (value) {
            changingBySubject = true;
            observable(value);
            changingBySubject = false;
        });

        return observable;
    }

    ko.subscribable.fn.toObservable = ko2rx;
    ko.observable.fn.toObservableWithReplyLatest = ko2rxReply;
    ko.observable.fn.toSubject = ko2rxSubject;
    ko.computed.fn.toObservableWithReplyLatest = ko2rxReply;
    rxObservableProto.toKoSubscribable = rx2koSubscribable;
    rxObservableProto.toKoObservable = rx2koObservable;
    rx.Subject.prototype.toKoObservable = rxSubject2koObservable;
}));
//# sourceMappingURL=knockout.rx.js.map
