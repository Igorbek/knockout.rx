/// <reference path="../../external/DefinitelyTyped/qunit/qunit.d.ts"/>
/// <reference path="../../external/DefinitelyTyped/knockout.rx/knockout.rx.d.ts"/>

test("Rx.IObservable.toKoObservable()", () => {
	var xs = new Rx.Subject<number>();
	var xo = xs.toKoObservable();

	xs.onNext(10);

	equal(xo(), 10, "first value set");

	xs.onNext(20);
	xs.onNext(1);

	equal(xo(), 1, "last setted value");

	xo(2);

	equal(xo(), 2, "set value in ko.observable");

	xs.onNext(3);

	equal(xo(), 3, "changed value");
});

test("Rx.IObservable.toKoObservable(initialValue)", () => {
	var xs = new Rx.Subject<number>();
	var xo = xs.toKoObservable(20);

	equal(xo(), 20, "initial value");

	xs.onNext(10);
	xs.onNext(20);
	xs.onNext(1);

	equal(xo(), 1, "changed value");
});

test("Rx.IObservable.toKoSubscribable()", () => {
	var xs = new Rx.Subject<number>();
	var xo = xs.toKoSubscribable();

	var value = 1;

	xs.onNext(2);

	var s = xo.subscribe(v => value = v);

	equal(value, 1, "value not changed before subscription");

	xs.onNext(3);

	equal(value, 3, "value changed after subscription");

	s.dispose();

	xs.onNext(4);

	equal(value, 3, "value not changed after unsubscription");

	xo.subscribe<Error>(err => equal(err.message, "some error", "catch error by 'onError' event"), null, "onError");
	xo.subscribe<Error>(err => equal(err.message, "some error", "catch error by 'error' event"), null, "error");

	xs.onError(new Error("some error"));

	throws(() => xo.subscribe(() => { }, null, "some"), "disallow unknown event types");
});

test("Rx.IObservable.toKoSubscribable() - onComplete", () => {
	var xs = new Rx.Subject<number>();
	var xo = xs.toKoSubscribable();

	xo.subscribe<void>(() => ok(true, "catch complete by 'onCompleted' event"), null, "onCompleted");
	xo.subscribe<void>(() => ok(true, "catch complete by 'complete' event"), null, "complete");

	xs.onCompleted();
});

test("ko.observable.toObservable()", () => {
	var xo = ko.observable(1);
	var xs = xo.toObservable();

	var notifications: Rx.INotification<number>[] = [];

	equal(xo.getSubscriptionsCount(), 0, "no subscriptions before subscribe");

	var s = xs.materialize().subscribe(n => notifications.push(n));

	equal(xo.getSubscriptionsCount(), 1, "Count subscriptions after subscribe");

	equal(notifications.length, 0, "no notifications before any change");

	xo(2);

	ok(notifications.length == 1
		&& notifications[0].kind == "N"
		&& notifications[0].value === 2,
		"have got notification after first change");

	xo(3);
	xo(4);

	ok(notifications.length == 3
		&& notifications[2].kind == "N"
		&& notifications[2].value === 4,
		"multiple changes");

	s.dispose();

	xo(5);

	equal(notifications.length, 3, "have no notifications after unsubscribe");

	equal(xo.getSubscriptionsCount(), 0, "no subscriptions after unsubscribe");
});

test("ko.observable.toObservableWithReplyLatest()", () => {
	var xo = ko.observable(1);
	var xs = xo.toObservableWithReplyLatest();

	var notifications: Rx.INotification<number>[] = [];

	equal(xo.getSubscriptionsCount(), 0, "no subscriptions before subscribe");

	var s = xs.materialize().subscribe(n => notifications.push(n));

	equal(xo.getSubscriptionsCount(), 1, "Count subscriptions after subscribe");

	ok(notifications.length == 1
		&& notifications[0].kind == "N"
		&& notifications[0].value === 1,
		"have got notification with latest after subscription before first change");

	xo(2);

	ok(notifications.length == 2
		&& notifications[1].kind == "N"
		&& notifications[1].value === 2,
		"change notification");

	s.dispose();

	xo(3);

	equal(notifications.length, 2, "have no notifications after unsubscribe");

	equal(xo.getSubscriptionsCount(), 0, "no subscriptions after unsubscribe");
});

test("ko.computed.toObservableWithReplyLatest()", () => {
	var xo = ko.observable(1);
	var xc = ko.computed(() => xo() * 2);
	var xs = xc.toObservableWithReplyLatest();

	var notifications: Rx.INotification<number>[] = [];

	equal(xc.getSubscriptionsCount(), 0, "no subscriptions before subscribe");

	var s = xs.materialize().subscribe(n => notifications.push(n));

	equal(xc.getSubscriptionsCount(), 1, "Count subscriptions after subscribe");

	ok(notifications.length == 1
		&& notifications[0].kind == "N"
		&& notifications[0].value === 2,
		"have got notification with latest after subscription before first change");

	xo(2);

	ok(notifications.length == 2
		&& notifications[1].kind == "N"
		&& notifications[1].value === 4,
		"change notification");

	s.dispose();

	xo(3);

	equal(notifications.length, 2, "have no notifications after unsubscribe");

	equal(xc.getSubscriptionsCount(), 0, "no subscriptions after unsubscribe");
});
