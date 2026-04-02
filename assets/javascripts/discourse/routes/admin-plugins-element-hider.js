import DiscourseRoute from "discourse/routes/discourse";

export default class AdminPluginsElementHiderRoute extends DiscourseRoute {
  beforeModel() {
    this.router.transitionTo("adminSiteSettings", {
      queryParams: { filter: "element_hider" },
    });
  }
}
