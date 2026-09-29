package com.careconnect.ehr.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI careConnectOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CareConnect EHR - RESTful API Specification")
                        .description("Enterprise-grade Electronic Health Record (EHR) Web API supporting Patient Portals, Clinical SOAP Documentation, CPOE, e-Prescribing, and HIPAA Security Audits.")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("CareConnect Healthcare Engineering")
                                .email("support@careconnect.org"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://springdoc.org")));
    }
}
