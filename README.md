# knockout.rx

Reactive Extensions bindings for the KnockoutJS

## Download

You can download built library from `out` folder in the repository.

## Usage

For typeScript users typing definition could be found [here](https://github.com/Igorbek/DefinitelyTyped/tree/knockout.rx/knockout.rx).

### Knockout to Rx

```javascript
var rxObservable = koSubscribable.toObservable(event?: string);
```

- `rxObservable` *return* - resulting Rx observable object
- `koSubscribable` - source Knockout subscribable object (observable, computed)
- `event` *optional* - event of subscribable to observe; if not specified, used default event for this subscribable (usually 'change' event).

```javascript
var rxObservable = koObservableOrComputed.toObservableWithReplyLatest();
```

- `rxObservable` *return* - resulting Rx observable object
- `koObservableOrComputed` - source Knockout observable or computed object

*Note*: `toObservableWithReplyLatest` returns Rx observable that will notify every observer with latest (current) Ko observable (or computed) value once it subscribed.

### Rx to Knockout observale

```javascript
var koObservable = rxObservable.toKoObservable(initialValue?: any);
```

- `koObservable` *return* - resulting Knockout observable object
- `rxObservable` - source Rx observable object
- `intialValue` *optional* - initial value to keep in resulting Knockout observable before first notification from source Rx observable

### Rx to Knockout subscribable

```javascript
var koSubscribable = rxObservable.toKoSubscribable();
```

- `koSubscribable` *return* - resulting Knockout subscribable object
- `rxObservable` - source Rx observable object

*Note*: The knockout subscribable does not store last value as Knockout observable do, it used only for change notifications. Exactly like Rx observable.
