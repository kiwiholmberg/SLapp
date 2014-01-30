#include <pebble.h>

#include "entry.h"

static Window *window;

static TextLayer *list_layer;
static char buses[512];

enum {
  BUSES_KEY = 0x0,
  REFRESH_KEY = 0x1
};

static void update_times(void) {
  // Update the timetable on screen.
  Tuplet refresh_tuple = TupletInteger(REFRESH_KEY, 1);

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  if (iter == NULL) {
    return;
  }

  dict_write_tuplet(iter, &refresh_tuple);
  dict_write_end(iter);

  app_message_outbox_send();
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  update_times();
}

static void select_long_click_handler(ClickRecognizerRef recognizer, void *context) {
  //Change to settings screen. WIP
  //text_layer_set_text(list_layer, "Laddar...");
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_long_click_subscribe(BUTTON_ID_SELECT, 0, select_long_click_handler, NULL);
}

static void in_received_handler(DictionaryIterator *iter, void *context) {
  //Recieve data from phone
  Tuple *buses_tuple = dict_find(iter, BUSES_KEY);
  if (buses_tuple) {
    vibes_double_pulse();
    strncpy(buses,buses_tuple->value->cstring, 512);
    text_layer_set_text(list_layer, buses);
  }
}

static void in_dropped_handler(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Dropped!");
}

static void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Failed to Send!");
}

static void app_message_init(void) {
  // Register message handlers
  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);
  app_message_register_outbox_failed(out_failed_handler);
  // Init buffers
  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
  update_times();
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  list_layer = text_layer_create(
    (GRect) { .origin = { 0,0}, .size = { bounds.size.w, bounds.size.h } });
  text_layer_set_text(list_layer, "YOLO");
  text_layer_set_font(list_layer, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(list_layer));

  //Initial loading 
  update_times();
}

static void window_unload(Window *window) {
  text_layer_destroy(list_layer);
}

static void init(void) {
  window = window_create();
  app_message_init();
  char entry_title[] = "Välj inställning";
  entry_init(entry_title);
  window_set_click_config_provider(window, click_config_provider);
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(window, animated);
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

  app_event_loop();
  deinit();
}
