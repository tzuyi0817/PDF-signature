import type { Component } from 'vue';

export type AsyncComponent = () => Promise<Component>;
