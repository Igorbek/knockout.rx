/// <reference path="../external/DefinitelyTyped/knockout.rx/knockout.rx.d.ts"/>

(function () {
	var rxObservableProto: Rx.IObservable<any> = Rx.Observable.prototype;
	function noop() { }

	function ko2rx<T>(event?: string): Rx.IObservable<T> {
		// KnockoutSubscription implements Rx._IDisposable
		return Rx.Observable.createWithDisposable(observer => (<KnockoutSubscribable<T>>this).subscribe(observer.onNext, observer, event));
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
			var disposable = (<Rx.IObservable<T>>this).subscribe(observer) || Rx.Disposable.empty;
			return {
				dispose: () => {
					if (disposable) {
						disposable.dispose();
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
		(<Rx.IObservable<T>>this).subscribe(observable);
		return observable;
	}

	ko.subscribable.fn.toObservable = ko2rx;
	rxObservableProto.toKoSubscribable = rx2koSubscribable;
	rxObservableProto.toKoObservable = rx2koObservable;
})();
