const axios = require("axios");

const checkUrl = async (url) => {
    try {
        const parsedUrl = new URL(url);

        const domain = parsedUrl.hostname;
        const cleanDomain = domain.replace(/^www\./, "");

        try {
            const response = await axios.get(
                `https://rdap.org/domain/${cleanDomain}`,
                {
                    timeout: 10000
                }
            );

            const events = response.data.events || [];

            const registrationEvent = events.find(
                (event) =>
                    event.eventAction === "registration"
            );

            let domainAgeDays = null;

            if (registrationEvent) {
                const registrationDate = new Date(
                    registrationEvent.eventDate
                );

                domainAgeDays = Math.floor(
                    (Date.now() -
                        registrationDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
            }

            return {
                url,
                domain: cleanDomain,
                registered: !!registrationEvent,
                registration_date: registrationEvent
                    ? registrationEvent.eventDate
                    : null,
                domain_age_days: domainAgeDays,
                lookup_status: "success"
            };

        } catch (error) {
            if (error.response?.status === 404) {
                return {
                    url,
                    domain: cleanDomain,
                    registered: false,
                    registration_date: null,
                    domain_age_days: null,
                    lookup_status: "not_found"
                };
            }

            throw error;
        }

    } catch (error) {
        console.error(
            "URL check failed:",
            error.message
        );

        return {
            url,
            domain: null,
            registered: false,
            registration_date: null,
            domain_age_days: null,
            lookup_status: "error"
        };
    }
};

module.exports = {
    checkUrl
};