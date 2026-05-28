<script setup lang="ts">
import { ref } from '#imports'

// State for interactive EmailSubscribeForm configuration
const customButtonText = ref('Join the List')
const customPlaceholder = ref('Email...')
const showPrivacyOption = ref(true)
const customMarketingText = ref('Zero spam. Unsubscribe with one click.')
const customAppendIcon = ref('mdi-arrow-right')
const customPrependIcon = ref('mdi-email-outline')

// Mock submit URL for testing
const testSubmitUrl = ref('https://api.mailerlite.com/v2/groups/123456/subscribers')

// Dynamic links for demonstration
const dynamicDemoLinks = [
  { text: 'Dynamic Page: Features Demo', to: '/features-demo' },
  { text: 'Dynamic Page: Pricing Options', to: '/pricing-demo' },
  { text: 'Dynamic Page: Contact Support', to: '/contact-support' },
  { text: 'Dynamic Page: Custom Route', to: '/custom-route-slug' },
]
</script>

<template>
  <v-container>
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="text-overline text-secondary font-weight-bold mb-2">
          Nuxtify Pages Module
        </div>
        <h1 class="text-h3 font-weight-bold mb-4">
          Pages & Layouts Showcase
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis max-width-800">
          The <strong>@nuxtify/pages</strong> module packages pre-built layouts, responsive navigation bars, slide-out drawer menus, interactive announcements, newsletter subscribe components, and dynamic fallbacks. Below are the key components and features in action.
        </p>
        <v-divider class="mt-6" />
      </v-col>
    </v-row>

    <!-- Section 1: Email Subscribe Form -->
    <v-row class="mb-8">
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon
            icon="mdi-email-check-outline"
            color="secondary"
            size="large"
            class="mr-2"
          />
          <h2 class="text-h5 font-weight-bold">
            Email Subscribe Form
          </h2>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-6">
          The <code>&lt;EmailSubscribeForm&gt;</code> is a highly configurable newsletter form. It automatically captures standard fields, tracks UTM parameters (source, medium, campaign, term, content), supports custom validation rules, integrates with analytics events (fires userSignUp), and supports smooth custom redirects or thank-you message transitions.
        </p>

        <v-row>
          <!-- Live Form 1 (Default Setup) -->
          <v-col
            cols="12"
            lg="6"
          >
            <v-card
              class="pa-6 border"
              variant="outlined"
            >
              <div class="d-flex justify-between align-center mb-4">
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold">
                    Default Configuration
                  </h3>
                  <div class="text-caption text-medium-emphasis">
                    Pulls submit-url directly from configuration
                  </div>
                </div>
                <v-chip
                  size="small"
                  color="primary"
                  class="ml-auto"
                >
                  Standard
                </v-chip>
              </div>

              <div class="py-4 px-2 bg-grey-lighten-4 rounded mb-4">
                <EmailSubscribeForm :submit-url="testSubmitUrl" />
              </div>

              <div class="text-caption text-medium-emphasis">
                <strong>Configured URL:</strong> <code>{{ testSubmitUrl }}</code>
              </div>
            </v-card>
          </v-col>

          <!-- Live Form 2 (Custom Props Playground) -->
          <v-col
            cols="12"
            lg="6"
          >
            <v-card
              class="pa-6 border"
              variant="outlined"
            >
              <div class="d-flex justify-between align-center mb-4">
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold">
                    Custom Props & Styles
                  </h3>
                  <div class="text-caption text-medium-emphasis">
                    Customized via component properties
                  </div>
                </div>
                <v-chip
                  size="small"
                  color="secondary"
                  class="ml-auto"
                >
                  Customized
                </v-chip>
              </div>

              <div class="py-4 px-2 bg-grey-lighten-4 rounded mb-4">
                <EmailSubscribeForm
                  :submit-url="testSubmitUrl"
                  :button-text="customButtonText"
                  :email-placeholder="customPlaceholder"
                  :show-privacy="showPrivacyOption"
                  :marketing-consent-text="customMarketingText"
                  :append-button-icon="customAppendIcon"
                  :prepend-button-icon="customPrependIcon"
                />
              </div>

              <!-- Interactive Controls inside Playground -->
              <h4 class="text-caption font-weight-bold mb-2">
                Customize Props in Real-Time:
              </h4>
              <v-row dense>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    v-model="customButtonText"
                    label="Button Text"
                    variant="underlined"
                    density="compact"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    v-model="customPlaceholder"
                    label="Email Placeholder"
                    variant="underlined"
                    density="compact"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    v-model="customMarketingText"
                    label="Consent Text"
                    variant="underlined"
                    density="compact"
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  class="d-flex align-center"
                >
                  <v-checkbox
                    v-model="showPrivacyOption"
                    label="Show Privacy Policy Link"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Section 2: Dynamic Routing Slug -->
    <v-row class="mb-8">
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon
            icon="mdi-routes"
            color="secondary"
            size="large"
            class="mr-2"
          />
          <h2 class="text-h5 font-weight-bold">
            Dynamic Slug Routing (/:slug)
          </h2>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-6">
          The module automatically extends Nuxt routing to capture all unregistered paths under the <code>/:slug</code> parameter using <code>DynamicSlug.vue</code>. This allows single-page websites to render mock/dynamic pages on the fly without creating redundant route files.
        </p>

        <v-card
          class="pa-6 border"
          variant="outlined"
        >
          <h3 class="text-subtitle-1 font-weight-bold mb-4">
            Test Dynamic Fallbacks
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Click any of the links below. They do not exist as physical files in <code>playground/pages/</code>. Instead, they are caught by the <code>DynamicSlug</code> layout registered by the module:
          </p>

          <v-row>
            <v-col
              v-for="link in dynamicDemoLinks"
              :key="link.to"
              cols="12"
              sm="6"
              md="3"
            >
              <v-btn
                :to="link.to"
                color="secondary"
                variant="tonal"
                block
                prepend-icon="mdi-arrow-right-circle-outline"
                class="text-none"
              >
                {{ link.text.split(': ')[1] }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Section 3: App Footer & Footer CTA -->
    <v-row class="mb-8">
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon
            icon="mdi-page-layout-footer"
            color="secondary"
            size="large"
            class="mr-2"
          />
          <h2 class="text-h5 font-weight-bold">
            Footer Call To Action
          </h2>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-6">
          The <code>&lt;FooterCallToAction&gt;</code> is automatically injected into the default site footer layout when enabled in the configuration options (via <code>footer.cta.show</code>). Let's render a preview of the CTA component below:
        </p>

        <v-card class="bg-primary text-white pa-8 text-center rounded-lg">
          <FooterCallToAction />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.max-width-800 {
  max-width: 800px;
}
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
