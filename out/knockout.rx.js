(function () {
    var rxObservableProto = Rx.Observable.prototype;
    function noop() {
    }

    function ko2rx(event) {
        var _this = this;
        return Rx.Observable.createWithDisposable(function (observer) {
            return (_this).subscribe(observer.onNext, observer, event);
        });
    }

    function ko2rxReply(event) {
        var _this = this;
        return Rx.Observable.createWithDisposable(function (observer) {
            observer.onNext((_this).peek());
            return (_this).subscribe(observer.onNext, observer, event);
        });
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
            var disposable = (_this).subscribe(observer) || Rx.Disposable.empty;
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
        (this).subscribe(observable);
        return observable;
    }

    ko.subscribable.fn.toObservable = ko2rx;
    ko.observable.fn.toObservableWithReplyLatest = ko2rxReply;
    ko.computed.fn.toObservableWithReplyLatest = ko2rxReply;
    rxObservableProto.toKoSubscribable = rx2koSubscribable;
    rxObservableProto.toKoObservable = rx2koObservable;
})();
//# sourceMappingURL=knockout.rx.js.map
