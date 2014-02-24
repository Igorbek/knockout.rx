/// <reference path="../external/DefinitelyTyped/knockout.rx/knockout.rx.d.ts"/>

(function () {
	var rxObservableProto = <Rx.Observable<any>>(<any>Rx.Observable).prototype;
	function noop() { }

	function ko2rx<T>(event?: string): Rx.Observable<T> {
		// KnockoutSubscription implements Rx._IDisposable
		return Rx.Observable.createWithDisposable<T>(observer => (<KnockoutSubscribable<T>>this).subscribe(observer.onNext, observer, event));
	}

	function ko2rxReply<T>(event?: string): Rx.Observable<T> {
		return Rx.Observable.createWithDisposable<T>(observer => {
			observer.onNext((<KnockoutObservable<T>>this).peek());
			return (<KnockoutSubscribable<T>>this).subscribe(observer.onNext, observer, event); // KnockoutSubscription implements Rx._IDisposable
		});
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
	ko.computed.fn.toObservableWithReplyLatest = ko2rxReply;
	rxObservableProto.toKoSubscribable = rx2koSubscribable;
	rxObservableProto.toKoObservable = rx2koObservable;
})();
