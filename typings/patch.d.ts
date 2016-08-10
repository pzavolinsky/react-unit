interface Array<T> {
    filter<U extends T>(pred:(a:T) => a is U):U[];
}
