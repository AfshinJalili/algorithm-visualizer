import { sprintf } from 'sprintf-js';
import Tracer from './Tracer';
import { LogRenderer } from 'core/renderers';

class LogTracer extends Tracer {
  log: string;

  getRendererClass() {
    return LogRenderer;
  }

  set(log: string = '') {
    this.log = log;
    super.set();
  }

  print(message: string) {
    this.log += message;
  }

  println(message: string) {
    this.print(message + '\n');
  }

  printf(format: string, ...args: any[]) {
    this.print(sprintf(format, ...args));
  }
}

export default LogTracer;
