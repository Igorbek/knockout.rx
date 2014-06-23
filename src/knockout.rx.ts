/// <reference path="../external/DefinitelyTyped/knockout.rx/knockout.rx.d.ts"/>
/// <reference path="../external/DefinitelyTyped/requirejs/require.d.ts"/>

declare var exports: any;
declare var module: any;

(function (factory: (rx: typeof Rx, ko: KnockoutStatic) => void) {
	if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
		factory(require("rx"), require("knockout"));
	} else if (typeof define === "function" && define["amd"]) {
		define(["rx", "knockout"], factory);
	} else {
		factory(Rx, ko);
	}
}(function(rx: typeof Rx, ko: KnockoutStatic) {
	var rxObservableProto = <Rx.Observable<any>>(<any>rx.Observable).prototype;

	function noop() {}

	function ko2rx<T>(event?: string): Rx.Observable<T> {
		// KnockoutSubscription implements Rx._IDisposable
		return rx.Observable.createWithDisposable<T>(observer => (<KnockoutSubscribable<T>>this).subscribe(observer.onNext, observer, event));
	}

	function ko2rxReply<T>(event?: string): Rx.Observable<T> {
		return rx.Observable.createWithDisposable<T>(observer => {
			observer.onNext((<KnockoutObservable<T>>this).peek());
			return (<KnockoutSubscribable<T>>this).subscribe(observer.onNext, observer, event); // KnockoutSubscription implements Rx._IDisposable
		});
	}

	function ko2rxSubject<T>(): Rx.ISubject<T> {
		var observable = <KnockoutObservable<T>>this;
		return rx.Subject.create<T>(
			rx.Observer.create<T>(value => observable(value)),
			observable.toObservable());
	}

	function rx2koSubscribable<T>(): KnockoutSubscribable<T> {
		var subscribable = new ko.subscribable<T>();
		var subscriptionCount = 0;

		subscribable.subscribe = (callback: (newValue: T) => void, target?: any, event?: string): KnockoutSubscription => {

			var observer = (!event || event == "change" || event == "onNext") ? Rx.Observer.create<T>(callback)
				: (event == "onError" || event == "error") ? Rx.Observer.create<T>(noop, callback)
				: (event == "onCompleted" || event == "complete") ? Rx.Observer.create<T>(noop, noop, <() => void>callback)
				: null;

			if (!observer)
				throw new Error("Unknown event '" + event + "'");

			subscriptionCount++;
			var disposable = (<Rx.Observable<T>>this).subscribe(observer) || Rx.Disposable.empty;
			return {
				dispose: () => {
					if (disposable) {
						disposable.dispose();
						disposable = null;
						subscriptionCount--;
					}
				}
			};
		};

		subscribable.getSubscriptionsCount = () => subscriptionCount;

		return subscribable;
	}

	function rx2koObservable<T>(initialValue?: T): KnockoutObservable<T> {
		var observable = ko.observable(initialValue);
		(<Rx.Observable<T>>this).subscribe(observable);
		return observable;
	}

	ko.subscribable.fn.toObservable = ko2rx;
	ko.observable.fn.toObservableWithReplyLatest = ko2rxReply;
	ko.observable.fn.toSubject = ko2rxSubject;
	ko.computed.fn.toObservableWithReplyLatest = ko2rxReply;
	rxObservableProto.toKoSubscribable = rx2koSubscribable;
	rxObservableProto.toKoObservable = rx2koObservable;
}));